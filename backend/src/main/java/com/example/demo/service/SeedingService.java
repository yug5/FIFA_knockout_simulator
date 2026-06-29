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

        // 32 Real World Cup teams
        String[] teams = {
            "South Africa", "Canada", "Brazil", "Japan", "Germany", "Paraguay", "Netherlands", "Morocco",
            "Côte d’Ivoire", "Norway", "France", "Sweden", "Mexico", "Ecuador", "England", "Congo - Kinshasa",
            "Belgium", "Senegal", "United States", "Bosnia & Herzegovina", "Spain", "Austria", "Portugal", "Croatia",
            "Switzerland", "Algeria", "Australia", "Egypt", "Argentina", "Cape Verde", "Colombia", "Ghana"
        };

        // 1. ROUND OF 32 (16 matches)
        List<Match> r32 = new ArrayList<>();
        for (int i = 0; i < 16; i++) {
            Match m = new Match(Round.ROUND_OF_32, teams[2 * i], teams[2 * i + 1], i);
            m.setFlag1(getFlagUrl(teams[2 * i]));
            m.setFlag2(getFlagUrl(teams[2 * i + 1]));
            r32.add(m);
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

    private String getFlagUrl(String team) {
        if (team == null) return null;
        switch (team) {
            case "South Africa": return "https://flagcdn.com/za.svg";
            case "Canada": return "https://flagcdn.com/ca.svg";
            case "Brazil": return "https://flagcdn.com/br.svg";
            case "Japan": return "https://flagcdn.com/jp.svg";
            case "Germany": return "https://flagcdn.com/de.svg";
            case "Paraguay": return "https://flagcdn.com/py.svg";
            case "Netherlands": return "https://flagcdn.com/nl.svg";
            case "Morocco": return "https://flagcdn.com/ma.svg";
            case "Côte d’Ivoire": return "https://flagcdn.com/ci.svg";
            case "Norway": return "https://flagcdn.com/no.svg";
            case "France": return "https://flagcdn.com/fr.svg";
            case "Sweden": return "https://flagcdn.com/se.svg";
            case "Mexico": return "https://flagcdn.com/mx.svg";
            case "Ecuador": return "https://flagcdn.com/ec.svg";
            case "England": return "https://flagcdn.com/gb-eng.svg";
            case "Congo - Kinshasa": return "https://flagcdn.com/cd.svg";
            case "Belgium": return "https://flagcdn.com/be.svg";
            case "Senegal": return "https://flagcdn.com/sn.svg";
            case "United States": return "https://flagcdn.com/us.svg";
            case "Bosnia & Herzegovina": return "https://flagcdn.com/ba.svg";
            case "Spain": return "https://flagcdn.com/es.svg";
            case "Austria": return "https://flagcdn.com/at.svg";
            case "Portugal": return "https://flagcdn.com/pt.svg";
            case "Croatia": return "https://flagcdn.com/hr.svg";
            case "Switzerland": return "https://flagcdn.com/ch.svg";
            case "Algeria": return "https://flagcdn.com/dz.svg";
            case "Australia": return "https://flagcdn.com/au.svg";
            case "Egypt": return "https://flagcdn.com/eg.svg";
            case "Argentina": return "https://flagcdn.com/ar.svg";
            case "Cape Verde": return "https://flagcdn.com/cv.svg";
            case "Colombia": return "https://flagcdn.com/co.svg";
            case "Ghana": return "https://flagcdn.com/gh.svg";
            default: return null;
        }
    }
}
