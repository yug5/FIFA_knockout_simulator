package com.example.demo.controller;

import com.example.demo.dto.MatchDto;
import com.example.demo.entity.Match;
import com.example.demo.repository.MatchRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MatchController {

    private final MatchRepository matchRepository;

    public MatchController(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    @GetMapping("/matches")
    public List<MatchDto> getMatchesSorted() {
        List<Match> matches = matchRepository.findAll();
        
        // Sort by Round enum order and matchOrder order
        matches.sort(Comparator.comparing((Match m) -> m.getRound().ordinal())
                .thenComparing(Match::getMatchOrder));

        return matches.stream()
                .map(MatchDto::new)
                .collect(Collectors.toList());
    }
}
