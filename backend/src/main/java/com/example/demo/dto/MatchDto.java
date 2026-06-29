package com.example.demo.dto;

import com.example.demo.entity.Match;
import com.example.demo.entity.Round;

public class MatchDto {
    private Long id;
    private Round round;
    private String team1;
    private String team2;
    private String actualWinner;
    private Integer matchOrder;
    private Long nextMatchId;
    private String flag1;
    private String flag2;

    public MatchDto() {}

    public MatchDto(Match match) {
        this.id = match.getId();
        this.round = match.getRound();
        this.team1 = match.getTeam1();
        this.team2 = match.getTeam2();
        this.actualWinner = match.getActualWinner();
        this.matchOrder = match.getMatchOrder();
        this.nextMatchId = match.getNextMatchId();
        this.flag1 = match.getFlag1();
        this.flag2 = match.getFlag2();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getFlag1() {
        return flag1;
    }

    public void setFlag1(String flag1) {
        this.flag1 = flag1;
    }

    public String getFlag2() {
        return flag2;
    }

    public void setFlag2(String flag2) {
        this.flag2 = flag2;
    }
}
