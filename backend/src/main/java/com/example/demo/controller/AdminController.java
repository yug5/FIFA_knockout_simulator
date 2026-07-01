package com.example.demo.controller;

import com.example.demo.dto.MatchDto;
import com.example.demo.dto.ParticipantDto;
import com.example.demo.entity.Match;
import com.example.demo.entity.Participant;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.ParticipantRepository;
import com.example.demo.service.ScoringService;
import com.example.demo.service.SeedingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final SeedingService seedingService;
    private final ScoringService scoringService;
    private final MatchRepository matchRepository;
    private final ParticipantRepository participantRepository;

    public AdminController(SeedingService seedingService,
                           ScoringService scoringService,
                           MatchRepository matchRepository,
                           ParticipantRepository participantRepository) {
        this.seedingService = seedingService;
        this.scoringService = scoringService;
        this.matchRepository = matchRepository;
        this.participantRepository = participantRepository;
    }

    public static class ResultRequest {
        private String winner;

        public String getWinner() {
            return winner;
        }

        public void setWinner(String winner) {
            this.winner = winner;
        }
    }

    // Seed the matches
    @PostMapping("/matches/seed")
    public ResponseEntity<List<MatchDto>> seedMatches() {
        List<Match> seededMatches = seedingService.seedBracket();
        
        // Sort matches for output
        seededMatches.sort(Comparator.comparing((Match m) -> m.getRound().ordinal())
                .thenComparing(Match::getMatchOrder));

        List<MatchDto> dtos = seededMatches.stream()
                .map(MatchDto::new)
                .collect(Collectors.toList());

        return new ResponseEntity<>(dtos, HttpStatus.CREATED);
    }

    // GET /api/admin/matches (unfiltered admin view, sorted)
    @GetMapping("/matches")
    public ResponseEntity<List<MatchDto>> getAdminMatches() {
        List<Match> matches = matchRepository.findAll();
        matches.sort(Comparator.comparing((Match m) -> m.getRound().ordinal())
                .thenComparing(Match::getMatchOrder));

        List<MatchDto> dtos = matches.stream()
                .map(MatchDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // PUT /api/admin/matches/{id}/result (set winner and trigger recalculation)
    @PutMapping("/matches/{id}/result")
    public ResponseEntity<?> setWinner(@PathVariable Long id, @RequestBody ResultRequest request) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + id));

        String winner = request.getWinner().trim();
        if (winner.isEmpty()) {
            throw new IllegalArgumentException("Winner name cannot be empty");
        }

        // Validate winner name matches one of the competing teams
        if (match.getTeam1() != null && match.getTeam2() != null) {
            if (!winner.equalsIgnoreCase(match.getTeam1()) && !winner.equalsIgnoreCase(match.getTeam2())) {
                throw new IllegalArgumentException("Winner '" + winner + "' does not match either team: " + match.getTeam1() + " or " + match.getTeam2());
            }
        }

        match.setActualWinner(winner);
        match.setDecidedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        Match savedMatch = matchRepository.save(match);

        // Propagate winner to next match team slot if not Final
        if (match.getNextMatchId() != null) {
            Match nextMatch = matchRepository.findById(match.getNextMatchId()).orElse(null);
            if (nextMatch != null) {
                // If matchOrder is even, it goes to team1, if odd it goes to team2
                if (match.getMatchOrder() % 2 == 0) {
                    nextMatch.setTeam1(winner);
                } else {
                    nextMatch.setTeam2(winner);
                }
                matchRepository.save(nextMatch);
            }
        }

        // Trigger score recalculation for all participants
        scoringService.recalculateScores(id);

        return ResponseEntity.ok(new MatchDto(savedMatch));
    }

    // PUT /api/admin/participants/{id}/points (adjust points for a participant)
    @PutMapping("/participants/{id}/points")
    public ResponseEntity<ParticipantDto> adjustPoints(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + id));

        Integer points = body.get("points");
        if (points == null) {
            throw new IllegalArgumentException("Points value is required");
        }

        int currentBonus = participant.getBonusPoints() != null ? participant.getBonusPoints() : 0;
        participant.setBonusPoints(currentBonus + points);

        // Recalculate their total score
        scoringService.recalculateParticipantScore(participant);

        Participant savedParticipant = participantRepository.save(participant);
        return ResponseEntity.ok(new ParticipantDto(savedParticipant));
    }

    // PUT /api/admin/matches/{id}/teams (edit team names and flags)
    @PutMapping("/matches/{id}/teams")
    public ResponseEntity<MatchDto> updateTeams(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + id));

        if (body.containsKey("team1")) {
            match.setTeam1(body.get("team1"));
        }
        if (body.containsKey("team2")) {
            match.setTeam2(body.get("team2"));
        }
        if (body.containsKey("flag1")) {
            match.setFlag1(body.get("flag1"));
        }
        if (body.containsKey("flag2")) {
            match.setFlag2(body.get("flag2"));
        }

        Match savedMatch = matchRepository.save(match);
        return ResponseEntity.ok(new MatchDto(savedMatch));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        Map<String, String> err = new HashMap<>();
        err.put("error", e.getMessage());
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }
}
