package com.bluemoon.backend.controller;

import com.bluemoon.backend.service.HealthService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        try {
            return ResponseEntity.ok(healthService.checkHealth());
        } catch (Exception ex) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("service", "bluemoon-backend");
            error.put("status", "DOWN");
            error.put("database", "DOWN");
            error.put("message", "Không thể kết nối hoặc truy vấn cơ sở dữ liệu mẫu.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
        }
    }
}
