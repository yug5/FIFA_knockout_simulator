package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.Participant;
import com.example.demo.exception.NameAlreadyTakenException;
import com.example.demo.repository.ParticipantRepository;
import com.example.demo.service.PredictionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PredictionService predictionService;
    private final ParticipantRepository participantRepository;

    public PredictionController(PredictionService predictionService,
                                ParticipantRepository participantRepository) {
        this.predictionService = predictionService;
        this.participantRepository = participantRepository;
    }

    // Check name availability
    @PostMapping("/participants/check-name")
    public ResponseEntity<Map<String, Boolean>> checkName(@RequestParam String name) {
        boolean available = !participantRepository.existsByName(name.trim());
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", available);
        return ResponseEntity.ok(response);
    }

    // Submit predictions bracket
    @PostMapping("/predictions")
    public ResponseEntity<?> submitPredictions(@RequestBody SubmissionRequest request) {
        ParticipantDto participantDto = predictionService.submitPredictions(request);
        
        // Return only participant id + name as requested
        Map<String, Object> response = new HashMap<>();
        response.put("id", participantDto.getId());
        response.put("name", participantDto.getName());
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // View predictions by participant name
    @GetMapping("/predictions/{name}")
    public ResponseEntity<ParticipantPredictionsResponse> getPredictionsByName(@PathVariable String name) {
        ParticipantPredictionsResponse response = predictionService.getParticipantBracket(name);
        return ResponseEntity.ok(response);
    }

    // List all participants (browse grid)
    @GetMapping("/predictions")
    public ResponseEntity<List<ParticipantDto>> getAllParticipants() {
        return ResponseEntity.ok(predictionService.getAllParticipants());
    }

    // Live leaderboard standings
    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardRowDto>> getLeaderboard() {
        return ResponseEntity.ok(predictionService.getLeaderboard());
    }

    // Match picking stats and popularity
    @GetMapping("/stats/popularity")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(predictionService.getPopularityStats());
    }

    // Exception Handlers
    @ExceptionHandler(NameAlreadyTakenException.class)
    public ResponseEntity<Map<String, String>> handleConflict(NameAlreadyTakenException e) {
        Map<String, String> err = new HashMap<>();
        err.put("error", e.getMessage());
        return new ResponseEntity<>(err, HttpStatus.CONFLICT); // 409 Conflict
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        Map<String, String> err = new HashMap<>();
        err.put("error", e.getMessage());
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST); // 400 Bad Request
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        Map<String, String> err = new HashMap<>();
        err.put("error", e.getMessage());
        return new ResponseEntity<>(err, HttpStatus.NOT_FOUND); // 404 Not Found
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException e) {
        Map<String, String> err = new HashMap<>();
        err.put("error", e.getMessage());
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST); // 400 Bad Request
    }
}
