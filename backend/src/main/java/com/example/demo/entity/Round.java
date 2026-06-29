package com.example.demo.entity;

public enum Round {
    ROUND_OF_32(1),
    ROUND_OF_16(2),
    QUARTER_FINAL(4),
    SEMI_FINAL(8),
    FINAL(16);

    private final int points;

    Round(int points) {
        this.points = points;
    }

    public int getPoints() {
        return this.points;
    }
}
