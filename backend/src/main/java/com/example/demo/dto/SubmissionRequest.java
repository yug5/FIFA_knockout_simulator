package com.example.demo.dto;

import java.util.List;

public class SubmissionRequest {
    private String name;
    private List<PredictionItemDto> predictions;

    public SubmissionRequest() {}

    public SubmissionRequest(String name, List<PredictionItemDto> predictions) {
        this.name = name;
        this.predictions = predictions;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<PredictionItemDto> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<PredictionItemDto> predictions) {
        this.predictions = predictions;
    }
}
