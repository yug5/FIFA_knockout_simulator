package com.example.demo.dto;

import com.example.demo.entity.Prediction;
import com.example.demo.entity.Round;

public class PredictionDetailDto {
    private Long matchId;
    private Round round;
    private String team1;
    private String team2;
    private String actualWinner;
    private Integer matchOrder;
    private Long nextMatchId;
    private String predictedTeam;
    private Boolean isCorrect;

    public PredictionDetailDto() {}

    public PredictionDetailDto(Prediction pred) {
        this.matchId = pred.getMatch().getId();
        this.round = pred.getMatch().getRound();
        this.team1 = pred.getMatch().getTeam1();
        this.team2 = pred.getMatch().getTeam2();
        this.actualWinner = pred.getMatch().getActualWinner();
        this.matchOrder = pred.getMatch().getMatchOrder();
        this.nextMatchId = pred.getMatch().getNextMatchId();
        this.predictedTeam = pred.getPredictedTeam();
        this.isCorrect = pred.getIsCorrect();
    }

    // Getters and Setters
    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public Round getRound() {
        return round;
    }

    public void setRound(Round round) {
        this.round = round;
    }

    public String getTeam1() {
        return team1;
    }

    public void setTeam1(String team1) {
        this.team1 = team1;
    }

    public String getTeam2() {
        return team2;
    }

    public void setTeam2(String team2) {
        this.team2 = team2;
    }

    public String getActualWinner() {
        return actualWinner;
    }

    public void setActualWinner(String actualWinner) {
        this.actualWinner = actualWinner;
    }

    public Integer getMatchOrder() {
        return matchOrder;
    }

    public void setMatchOrder(Integer matchOrder) {
        this.matchOrder = matchOrder;
    }

    public Long getNextMatchId() {
        return nextMatchId;
    }

    public void setNextMatchId(Long nextMatchId) {
        this.nextMatchId = nextMatchId;
    }

    public String getPredictedTeam() {
        return predictedTeam;
    }

    public void setPredictedTeam(String predictedTeam) {
        this.predictedTeam = predictedTeam;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean correct) {
        isCorrect = correct;
    }
}
