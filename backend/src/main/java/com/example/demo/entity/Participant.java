package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participant")
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore = 0;

    @Column(name = "bonus_points", nullable = false)
    private Integer bonusPoints = 0;

    public Participant() {}

    public Participant(String name, LocalDateTime submittedAt) {
        this.name = name;
        this.submittedAt = submittedAt;
        this.totalScore = 0;
        this.bonusPoints = 0;
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

    public Integer getBonusPoints() {
        return bonusPoints;
    }

    public void setBonusPoints(Integer bonusPoints) {
        this.bonusPoints = bonusPoints;
    }
}
