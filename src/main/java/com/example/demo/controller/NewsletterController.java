package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private static final Logger log = LoggerFactory.getLogger(NewsletterController.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String mailFrom;

    public NewsletterController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Subscribe to the LocalConnect newsletter.
     * Sends a welcome email to the provided address.
     */
    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<String>> subscribe(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();

        if (email.isEmpty() || !email.contains("@")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please provide a valid email address."));
        }

        log.info("Newsletter subscription request from: {}", email);

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(email);
            msg.setSubject("🌐 Welcome to LocalConnect Newsletter!");
            msg.setText(
                "Hi there!\n\n" +
                "You've successfully subscribed to the LocalConnect newsletter. Welcome to the community! 🎉\n\n" +
                "Here's what you can look forward to each week:\n" +
                "  • 📰 Neighborhood highlights & top community posts\n" +
                "  • 🛡 Safety tips & local emergency alerts\n" +
                "  • 🛒 Featured local service providers near you\n" +
                "  • 🌱 Community events and initiatives\n\n" +
                "In the meantime, join your neighborhood on LocalConnect:\n" +
                "  👉 http://localhost:8080\n\n" +
                "Stay connected, stay safe.\n\n" +
                "With ❤️ from India,\n" +
                "The LocalConnect Team\n\n" +
                "--\n" +
                "You received this because you subscribed at localconnect.app.\n" +
                "To unsubscribe, reply with 'UNSUBSCRIBE' in the subject line."
            );
            mailSender.send(msg);
            log.info("Welcome newsletter email sent to: {}", email);
        } catch (Exception e) {
            // Log but don't fail — still confirm subscription UI-side
            log.warn("Could not send newsletter welcome email to {}: {}", email, e.getMessage());
        }

        return ResponseEntity.ok(
                ApiResponse.ok("Subscribed successfully! Check your inbox for a welcome email.", email));
    }
}
