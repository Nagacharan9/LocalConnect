package com.example.demo.service;

import com.example.demo.dto.UserDto;
import com.example.demo.entity.User;
import com.example.demo.exception.ApiException;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Value("${app.location.nearby-radius-km:2.0}")
    private double defaultNearbyRadius;

    // ── Helper: get authenticated user ──────────────────────────
    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> ApiException.notFound("Authenticated user not found"));
    }

    // ── Profile ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public UserDto.UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return UserDto.UserProfileDto.from(user);
    }

    @Transactional
    public UserDto.UserProfileDto updateProfile(UserDto.UpdateProfileRequest request) {
        User user = currentUser();
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setBio(request.getBio());
        user.setAvatarUrl(request.getAvatarUrl());
        return UserDto.UserProfileDto.from(userRepository.save(user));
    }

    // ── Location ─────────────────────────────────────────────────
    @Transactional
    public void updateLocation(Double latitude, Double longitude) {
        User user = currentUser();
        user.setLatitude(latitude);
        user.setLongitude(longitude);
        user.setLocationUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // ── Nearby Users (Haversine) ──────────────────────────────────
    @Transactional(readOnly = true)
    public List<UserDto.NearbyUserDto> getNearbyUsers(Double lat, Double lng, Double radiusKm) {
        User me = currentUser();
        double radius = (radiusKm != null) ? radiusKm : defaultNearbyRadius;
        double myLat  = (lat != null) ? lat : (me.getLatitude()  != null ? me.getLatitude()  : 0);
        double myLng  = (lng != null) ? lng : (me.getLongitude() != null ? me.getLongitude() : 0);

        List<User> nearby = userRepository.findNearbyUsers(me.getId(), myLat, myLng, radius);

        return nearby.stream().map(u -> {
            double dist = haversineKm(myLat, myLng,
                    u.getLatitude() != null ? u.getLatitude() : 0,
                    u.getLongitude() != null ? u.getLongitude() : 0);
            return UserDto.NearbyUserDto.from(u, dist);
        }).collect(Collectors.toList());
    }

    // ── Haversine helper ──────────────────────────────────────────
    public static double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
