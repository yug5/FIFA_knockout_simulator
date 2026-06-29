package com.example.demo.service;

import com.example.demo.entity.Match;
import com.example.demo.entity.Participant;
import com.example.demo.entity.Prediction;
import com.example.demo.entity.Round;
import com.example.demo.dto.*;
import com.example.demo.exception.NameAlreadyTakenException;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.ParticipantRepository;
import com.example.demo.repository.PredictionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    private final ParticipantRepository participantRepository;
    private final PredictionRepository predictionRepository;
    private final MatchRepository matchRepository;

    public PredictionService(ParticipantRepository participantRepository,
                             PredictionRepository predictionRepository,
                             MatchRepository matchRepository) {
        this.participantRepository = participantRepository;
        this.predictionRepository = predictionRepository;
        this.matchRepository = matchRepository;
    }

    @Transactional
    public ParticipantDto submitPredictions(SubmissionRequest request) {
        String trimmedName = request.getName().trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("Participant name cannot be empty");
        }

        // Validate uniqueness case-insensitively
        Optional<Participant> existing = participantRepository.findByName(trimmedName);
        if (existing.isPresent()) {
            throw new NameAlreadyTakenException("Name '" + trimmedName + "' is already taken");
        }

        // Fetch all matches to validate
        List<Match> allMatches = matchRepository.findAll();
        if (allMatches.isEmpty()) {
            throw new IllegalStateException("Matches have not been seeded yet. Admin must seed matches first.");
        }

        Map<Long, Match> matchMap = allMatches.stream()
                .collect(Collectors.toMap(Match::getId, m -> m));

        // Validate complete predictions (must predict all 31 matches)
        if (request.getPredictions() == null || request.getPredictions().size() != allMatches.size()) {
            throw new IllegalArgumentException("Invalid predictions size. Must submit exactly " + allMatches.size() + " match predictions");
        }

        Participant participant = new Participant(trimmedName, LocalDateTime.now());
        Participant savedParticipant = participantRepository.save(participant);

        List<Prediction> predictionsToSave = new ArrayList<>();
        int initialScore = 0;

        // Group matches by round for bonus calculations
        Map<Round, Long> matchesCountPerRound = allMatches.stream()
                .collect(Collectors.groupingBy(Match::getRound, Collectors.counting()));
        Map<Round, Integer> correctPicksPerRound = new HashMap<>();

        for (PredictionItemDto item : request.getPredictions()) {
            Match match = matchMap.get(item.getMatchId());
            if (match == null) {
                throw new IllegalArgumentException("Invalid match ID: " + item.getMatchId());
            }

            Prediction prediction = new Prediction(savedParticipant, match, item.getPredictedTeam().trim());
            
            // Check correctness immediately if actual winner is already entered
            String actualWinner = match.getActualWinner();
            if (actualWinner != null) {
                boolean isCorrect = prediction.getPredictedTeam().equalsIgnoreCase(actualWinner);
                prediction.setIsCorrect(isCorrect);

                if (isCorrect) {
                    Round round = match.getRound();
                    correctPicksPerRound.put(round, correctPicksPerRound.getOrDefault(round, 0) + 1);
                    initialScore += round.getPoints();
                }
            } else {
                prediction.setIsCorrect(null);
            }

            predictionsToSave.add(prediction);
        }

        predictionRepository.saveAll(predictionsToSave);

        // Apply perfect round bonuses to initial score if relevant
        for (Map.Entry<Round, Integer> entry : correctPicksPerRound.entrySet()) {
            Round round = entry.getKey();
            int correctCount = entry.getValue();
            long totalInRound = matchesCountPerRound.getOrDefault(round, 0L);

            if (correctCount == totalInRound && totalInRound > 0) {
                double bonus = totalInRound * round.getPoints() * 0.5;
                initialScore += (int) bonus;
            }
        }

        savedParticipant.setTotalScore(initialScore);
        Participant updatedParticipant = participantRepository.save(savedParticipant);

        return new ParticipantDto(updatedParticipant);
    }

    public ParticipantPredictionsResponse getParticipantBracket(String name) {
        String trimmedName = name.trim();
        Participant participant = participantRepository.findByName(trimmedName)
                .orElseThrow(() -> new NoSuchElementException("Participant not found: " + trimmedName));

        List<Prediction> predictions = predictionRepository.findByParticipantId(participant.getId());
        List<PredictionDetailDto> details = predictions.stream()
                .map(PredictionDetailDto::new)
                .collect(Collectors.toList());

        return new ParticipantPredictionsResponse(
                participant.getName(),
                participant.getSubmittedAt(),
                participant.getTotalScore(),
                details
        );
    }

    public List<ParticipantDto> getAllParticipants() {
        return participantRepository.findAll().stream()
                .map(ParticipantDto::new)
                .collect(Collectors.toList());
    }

    public List<LeaderboardRowDto> getLeaderboard() {
        List<Participant> sortedParticipants = participantRepository.findAllByOrderByTotalScoreDescSubmittedAtAsc();
        List<LeaderboardRowDto> leaderboard = new ArrayList<>();

        int currentRank = 1;
        for (Participant p : sortedParticipants) {
            List<Prediction> userPredictions = predictionRepository.findByParticipantId(p.getId());
            long correctCount = userPredictions.stream()
                    .filter(pred -> Boolean.TRUE.equals(pred.getIsCorrect()))
                    .count();

            leaderboard.add(new LeaderboardRowDto(
                    currentRank++,
                    p.getName(),
                    p.getTotalScore(),
                    correctCount
            ));
        }

        return leaderboard;
    }

    public Map<String, Object> getPopularityStats() {
        List<Prediction> allPredictions = predictionRepository.findAll();
        List<Match> allMatches = matchRepository.findAll();

        // 1. Group predictions by matchId
        Map<Long, List<Prediction>> predictionsByMatch = allPredictions.stream()
                .collect(Collectors.groupingBy(p -> p.getMatch().getId()));

        Map<Long, Map<String, Double>> matchPopularity = new HashMap<>();

        for (Match match : allMatches) {
            List<Prediction> preds = predictionsByMatch.getOrDefault(match.getId(), Collections.emptyList());
            int total = preds.size();

            Map<String, Double> pcts = new HashMap<>();
            pcts.put("team1", 0.0);
            pcts.put("team2", 0.0);

            if (total > 0 && match.getTeam1() != null && match.getTeam2() != null) {
                long team1Picks = preds.stream().filter(p -> p.getPredictedTeam().equalsIgnoreCase(match.getTeam1())).count();
                long team2Picks = preds.stream().filter(p -> p.getPredictedTeam().equalsIgnoreCase(match.getTeam2())).count();

                double t1Pct = (team1Picks * 100.0) / total;
                double t2Pct = (team2Picks * 100.0) / total;

                // Round to 1 decimal place
                pcts.put("team1", Math.round(t1Pct * 10.0) / 10.0);
                pcts.put("team2", Math.round(t2Pct * 10.0) / 10.0);
            }

            matchPopularity.put(match.getId(), pcts);
        }

        // 2. Find most popular Final/Champion pick overall
        // Champion pick is the predictedTeam for the FINAL match
        Match finalMatch = allMatches.stream()
                .filter(m -> m.getRound() == Round.FINAL)
                .findFirst()
                .orElse(null);

        String mostPopularChampion = "No predictions yet";
        if (finalMatch != null) {
            List<Prediction> finalPredictions = predictionsByMatch.getOrDefault(finalMatch.getId(), Collections.emptyList());
            Map<String, Long> champPicksCount = finalPredictions.stream()
                    .collect(Collectors.groupingBy(p -> p.getPredictedTeam().toUpperCase(), Collectors.counting()));

            String maxChamp = null;
            long maxCount = -1;
            for (Map.Entry<String, Long> entry : champPicksCount.entrySet()) {
                if (entry.getValue() > maxCount) {
                    maxCount = entry.getValue();
                    maxChamp = entry.getKey();
                }
            }

            if (maxChamp != null) {
                // Find matching original case of the team name
                String finalMaxChamp = maxChamp;
                mostPopularChampion = finalPredictions.stream()
                        .map(Prediction::getPredictedTeam)
                        .filter(name -> name.equalsIgnoreCase(finalMaxChamp))
                        .findFirst()
                        .orElse(maxChamp);
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("matchPopularity", matchPopularity);
        stats.put("mostPopularChampion", mostPopularChampion);

        return stats;
    }
}
