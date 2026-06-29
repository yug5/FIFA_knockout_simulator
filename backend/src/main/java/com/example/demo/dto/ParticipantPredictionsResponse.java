package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ParticipantPredictionsResponse {
    private String name;
    private LocalDateTime submittedAt;
    private Integer totalScore;
    private List<PredictionDetailDto> predictions;

    public ParticipantPredictionsResponse() {}

    public ParticipantPredictionsResponse(String name, LocalDateTime submittedAt, Integer totalScore, List<PredictionDetailDto> predictions) {
        this.name = name;
        this.submittedAt = submittedAt;
        this.totalScore = totalScore;
        this.predictions = predictions;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Integer getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }

    public List<PredictionDetailDto> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<PredictionDetailDto> predictions) {
        this.predictions = predictions;
    }
}
