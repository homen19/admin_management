package com.iit.admin;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IitAdminApplication {
    public static void main(String[] args) {
        SpringApplication.run(IitAdminApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseFixer(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE students DROP COLUMN department");
                System.out.println("[DB-FIX] Successfully dropped legacy department column from students table.");
            } catch (Exception e) {
                System.out.println("[DB-FIX] Legacy department column in students table not present or already dropped.");
            }
            try {
                jdbcTemplate.execute("ALTER TABLE faculty DROP COLUMN department");
                System.out.println("[DB-FIX] Successfully dropped legacy department column from faculty table.");
            } catch (Exception e) {
                System.out.println("[DB-FIX] Legacy department column in faculty table not present or already dropped.");
            }
            try {
                jdbcTemplate.execute("INSERT INTO roles (name) SELECT 'ROLE_DRIVER' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_DRIVER')");
                jdbcTemplate.execute("INSERT INTO roles (name) SELECT 'ROLE_TRANSPORT_STAFF' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_TRANSPORT_STAFF')");
                jdbcTemplate.execute("INSERT INTO roles (name) SELECT 'ROLE_INVENTORY_ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_INVENTORY_ADMIN')");
                System.out.println("[DB-FIX] Added missing roles (DRIVER, TRANSPORT, INVENTORY).");
            } catch (Exception e) {}
        };
    }
}
