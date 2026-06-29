package com.example.demo.dto;

public class PredictionItemDto {
    private Long matchId;
    private String predictedTeam;

    public PredictionItemDto() {}

    public PredictionItemDto(Long matchId, String predictedTeam) {
        this.matchId = matchId;
        this.predictedTeam = predictedTeam;
    }

    // Getters and Setters
    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public String getPredictedTeam() {
        return predictedTeam;
    }

    public void setPredictedTeam(String predictedTeam) {
        this.predictedTeam = predictedTeam;
    }
}
