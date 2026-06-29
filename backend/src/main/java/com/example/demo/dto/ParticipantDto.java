package com.example.demo.dto;

import com.example.demo.entity.Participant;
import java.time.LocalDateTime;

public class ParticipantDto {
    private Long id;
    private String name;
    private LocalDateTime submittedAt;
    private Integer totalScore;

    public ParticipantDto() {}

    public ParticipantDto(Participant p) {
        this.id = p.getId();
        this.name = p.getName();
        this.submittedAt = p.getSubmittedAt();
        this.totalScore = p.getTotalScore();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
}
