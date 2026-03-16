package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminDataInitializer.class);
    private final UserRepository userRepository;

    public AdminDataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "charannaga460@gmail.com";
        
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                .name("Charan Naga")
                .email(adminEmail)
                .role(Role.ADMIN)
                .verified(true)
                .build();
            userRepository.save(admin);
            log.info("Successfully created default ADMIN user: {}", adminEmail);
        } else {
            User existing = userRepository.findByEmail(adminEmail).orElseThrow();
            if (existing.getRole() != Role.ADMIN) {
                existing.setRole(Role.ADMIN);
                userRepository.save(existing);
                log.info("Elevated {} to ADMIN role.", adminEmail);
            } else {
                log.info("ADMIN user {} already exists.", adminEmail);
            }
        }
    }
}
