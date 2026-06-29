package com.example.demo.service;

import com.example.demo.entity.Match;
import com.example.demo.entity.Participant;
import com.example.demo.entity.Prediction;
import com.example.demo.entity.Round;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.ParticipantRepository;
import com.example.demo.repository.PredictionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScoringService {

    private final ParticipantRepository participantRepository;
    private final PredictionRepository predictionRepository;
    private final MatchRepository matchRepository;

    public ScoringService(ParticipantRepository participantRepository,
                          PredictionRepository predictionRepository,
                          MatchRepository matchRepository) {
        this.participantRepository = participantRepository;
        this.predictionRepository = predictionRepository;
        this.matchRepository = matchRepository;
    }

    @Transactional
    public void recalculateScores(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));

        String winner = match.getActualWinner();
        List<Prediction> predictions = predictionRepository.findByMatchId(matchId);

        // Update correctness for all predictions of this match
        for (Prediction pred : predictions) {
            if (winner == null) {
                pred.setIsCorrect(null);
            } else {
                pred.setIsCorrect(pred.getPredictedTeam().equalsIgnoreCase(winner));
            }
        }
        predictionRepository.saveAll(predictions);

        // Recalculate scores for all participants from scratch
        List<Participant> participants = participantRepository.findAll();

        for (Participant participant : participants) {
            List<Prediction> userPredictions = predictionRepository.findByParticipantId(participant.getId());
            
            // Group user predictions by match round
            Map<Round, List<Prediction>> predictionsByRound = userPredictions.stream()
                    .collect(Collectors.groupingBy(p -> p.getMatch().getRound()));

            int totalScore = 0;

            for (Round round : Round.values()) {
                List<Prediction> roundPredictions = predictionsByRound.getOrDefault(round, Collections.emptyList());
                if (roundPredictions.isEmpty()) continue;

                int pointsPerMatch = round.getPoints();
                long totalUserChoiceMatches = 0;
                long correctUserChoices = 0;

                for (Prediction p : roundPredictions) {
                    Match m = p.getMatch();
                    boolean isUserChoice = true;
                    if (m.getActualWinner() != null) {
                        if (m.getDecidedAt() == null) {
                            isUserChoice = false;
                        } else if (participant.getSubmittedAt() != null && m.getDecidedAt().toLocalDateTime().isBefore(participant.getSubmittedAt())) {
                            isUserChoice = false;
                        }
                    }

                    if (isUserChoice) {
                        totalUserChoiceMatches++;
                        if (Boolean.TRUE.equals(p.getIsCorrect())) {
                            correctUserChoices++;
                            totalScore += pointsPerMatch;
                        }
                    }
                }

                // Stage bonus: +1 extra point if they get all user choices correct in this stage
                if (totalUserChoiceMatches > 0 && correctUserChoices == totalUserChoiceMatches) {
                    totalScore += 1;
                }
            }

            participant.setTotalScore(totalScore);
        }

        participantRepository.saveAll(participants);
    }
}
