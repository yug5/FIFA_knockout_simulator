package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "match_record")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Round round;

    @Column(name = "team_1")
    private String team1;

    @Column(name = "team_2")
    private String team2;

    @Column(name = "actual_winner")
    private String actualWinner;

    @Column(name = "match_order", nullable = false)
    private Integer matchOrder;

    @Column(name = "next_match_id")
    private Long nextMatchId;

    @Column(name = "decided_at")
    private java.sql.Timestamp decidedAt;

    @Column(name = "flag_1")
    private String flag1;

    @Column(name = "flag_2")
    private String flag2;

    public Match() {}

    public Match(Round round, String team1, String team2, Integer matchOrder) {
        this.round = round;
        this.team1 = team1;
        this.team2 = team2;
        this.matchOrder = matchOrder;
    }

    public Match(Round round, String team1, String team2, Integer matchOrder, Long nextMatchId) {
        this.round = round;
        this.team1 = team1;
        this.team2 = team2;
        this.matchOrder = matchOrder;
        this.nextMatchId = nextMatchId;
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

    public java.sql.Timestamp getDecidedAt() {
        return decidedAt;
    }

    public void setDecidedAt(java.sql.Timestamp decidedAt) {
        this.decidedAt = decidedAt;
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
