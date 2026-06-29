package com.example.demo.exception;

public class NameAlreadyTakenException extends RuntimeException {
    public NameAlreadyTakenException(String message) {
        super(message);
    }
}
