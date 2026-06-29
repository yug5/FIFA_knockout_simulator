package com.example.demo.repository;

import com.example.demo.entity.Match;
import com.example.demo.entity.Participant;
import com.example.demo.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByParticipant(Participant participant);
    List<Prediction> findByParticipantId(Long participantId);
    List<Prediction> findByMatch(Match match);
    List<Prediction> findByMatchId(Long matchId);
}
