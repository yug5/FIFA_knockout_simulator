package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "prediction")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "predicted_team", nullable = false)
    private String predictedTeam;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    public Prediction() {}

    public Prediction(Participant participant, Match match, String predictedTeam) {
        this.participant = participant;
        this.match = match;
        this.predictedTeam = predictedTeam;
        this.isCorrect = null;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Participant getParticipant() {
        return participant;
    }

    public void setParticipant(Participant participant) {
        this.participant = participant;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
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
