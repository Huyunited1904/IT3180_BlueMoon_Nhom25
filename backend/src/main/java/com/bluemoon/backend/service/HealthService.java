package com.bluemoon.backend.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    @PersistenceContext
    private EntityManager entityManager;

    public Map<String, Object> checkHealth() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("service", "bluemoon-backend");

        Object ping = entityManager.createNativeQuery("SELECT 1").getSingleResult();
        Number userCount = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM users").getSingleResult();

        result.put("status", "UP");
        result.put("database", "UP");
        result.put("dbPing", ((Number) ping).intValue());
        result.put("sampleUsersCount", userCount.longValue());
        return result;
    }
}
