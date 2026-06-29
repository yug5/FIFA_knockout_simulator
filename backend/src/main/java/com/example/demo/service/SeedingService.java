package com.example.demo.service;

import com.example.demo.entity.Match;
import com.example.demo.entity.Round;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.ParticipantRepository;
import com.example.demo.repository.PredictionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeedingService {

    private final MatchRepository matchRepository;
    private final PredictionRepository predictionRepository;
    private final ParticipantRepository participantRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public SeedingService(MatchRepository matchRepository,
                          PredictionRepository predictionRepository,
                          ParticipantRepository participantRepository) {
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional
    public List<Match> seedBracket() {
        // Clear all previous data to prevent foreign key issues
        predictionRepository.deleteAll();
        participantRepository.deleteAll();
        matchRepository.deleteAll();
        entityManager.createNativeQuery("ALTER TABLE match_record AUTO_INCREMENT = 1").executeUpdate();

        // 32 Teams placeholder names
        String[] teams = {
            "Team A", "Team B", "Team C", "Team D", "Team E", "Team F", "Team G", "Team H",
            "Team I", "Team J", "Team K", "Team L", "Team M", "Team N", "Team O", "Team P",
            "Team Q", "Team R", "Team S", "Team T", "Team U", "Team V", "Team W", "Team X",
            "Team Y", "Team Z", "Team AA", "Team AB", "Team AC", "Team AD", "Team AE", "Team AF"
        };

        // 1. ROUND OF 32 (16 matches)
        List<Match> r32 = new ArrayList<>();
        for (int i = 0; i < 16; i++) {
            r32.add(new Match(Round.ROUND_OF_32, teams[2 * i], teams[2 * i + 1], i));
        }
        r32 = matchRepository.saveAll(r32);

        // 2. ROUND OF 16 (8 matches)
        List<Match> r16 = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            r16.add(new Match(Round.ROUND_OF_16, null, null, i));
        }
        r16 = matchRepository.saveAll(r16);

        // 3. QUARTER FINAL (4 matches)
        List<Match> qf = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            qf.add(new Match(Round.QUARTER_FINAL, null, null, i));
        }
        qf = matchRepository.saveAll(qf);

        // 4. SEMI FINAL (2 matches)
        List<Match> sf = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            sf.add(new Match(Round.SEMI_FINAL, null, null, i));
        }
        sf = matchRepository.saveAll(sf);

        // 5. FINAL (1 match)
        Match finalMatch = new Match(Round.FINAL, null, null, 0);
        finalMatch = matchRepository.saveAndFlush(finalMatch);

        // Now link nextMatchId references
        // ROUND_OF_32 -> ROUND_OF_16
        for (int i = 0; i < 16; i++) {
            r32.get(i).setNextMatchId(r16.get(i / 2).getId());
        }
        matchRepository.saveAll(r32);

        // ROUND_OF_16 -> QUARTER_FINAL
        for (int i = 0; i < 8; i++) {
            r16.get(i).setNextMatchId(qf.get(i / 2).getId());
        }
        matchRepository.saveAll(r16);

        // QUARTER_FINAL -> SEMI_FINAL
        for (int i = 0; i < 4; i++) {
            qf.get(i).setNextMatchId(sf.get(i / 2).getId());
        }
        matchRepository.saveAll(qf);

        // SEMI_FINAL -> FINAL
        for (int i = 0; i < 2; i++) {
            sf.get(i).setNextMatchId(finalMatch.getId());
        }
        matchRepository.saveAll(sf);

        // Fetch all generated matches to return
        return matchRepository.findAll();
    }
}
