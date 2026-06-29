package com.example.demo.dto;

public class LeaderboardRowDto {
    private Integer rank;
    private String name;
    private Integer totalScore;
    private Long correctCount;

    public LeaderboardRowDto() {}

    public LeaderboardRowDto(Integer rank, String name, Integer totalScore, Long correctCount) {
        this.rank = rank;
        this.name = name;
        this.totalScore = totalScore;
        this.correctCount = correctCount;
    }

    // Getters and Setters
    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }

    public Long getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(Long correctCount) {
        this.correctCount = correctCount;
    }
}
