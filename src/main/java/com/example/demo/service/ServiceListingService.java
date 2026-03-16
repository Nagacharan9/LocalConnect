package com.example.demo.service;

import com.example.demo.dto.ServiceDto;
import com.example.demo.entity.Booking;
import com.example.demo.entity.ServiceListing;
import com.example.demo.entity.User;
import com.example.demo.enums.BookingStatus;
import com.example.demo.enums.NotificationType;
import com.example.demo.exception.ApiException;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.ServiceListingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServiceListingService {

    private final ServiceListingRepository serviceRepo;
    private final BookingRepository        bookingRepo;
    private final UserService              userService;
    private final NotificationService      notificationService;

    public ServiceListingService(ServiceListingRepository serviceRepo, BookingRepository bookingRepo, UserService userService, NotificationService notificationService) {
        this.serviceRepo = serviceRepo;
        this.bookingRepo = bookingRepo;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ServiceDto.ServiceListingResponse createListing(ServiceDto.CreateServiceRequest req) {
        User provider = userService.currentUser();
        ServiceListing listing = ServiceListing.builder()
                .provider(provider)
                .category(req.getCategory())
                .title(req.getTitle())
                .description(req.getDescription())
                .price(req.getPrice())
                .priceUnit(req.getPriceUnit())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .active(true)
                .build();
        return ServiceDto.ServiceListingResponse.from(serviceRepo.save(listing));
    }

    @Transactional(readOnly = true)
    public Page<ServiceDto.ServiceListingResponse> searchNearby(
            String category, double lat, double lng, double radiusKm, int page, int size) {
        return serviceRepo
                .findNearbyByCategory(lat, lng, radiusKm, category, PageRequest.of(page, size))
                .map(ServiceDto.ServiceListingResponse::from);
    }

    @Transactional(readOnly = true)
    public ServiceDto.ServiceListingResponse getById(Long id) {
        return serviceRepo.findById(id)
                .map(ServiceDto.ServiceListingResponse::from)
                .orElseThrow(() -> ApiException.notFound("Service not found"));
    }

    @Transactional
    public ServiceDto.BookingResponse createBooking(ServiceDto.CreateBookingRequest req) {
        User customer = userService.currentUser();
        ServiceListing service = serviceRepo.findById(req.getServiceId())
                .orElseThrow(() -> ApiException.notFound("Service not found"));

        Booking booking = Booking.builder()
                .service(service)
                .customer(customer)
                .status(BookingStatus.PENDING)
                .notes(req.getNotes())
                .scheduledAt(req.getScheduledAt())
                .build();
        booking = bookingRepo.save(booking);

        notificationService.send(
            service.getProvider().getId(), NotificationType.BOOKING_UPDATE,
            "New booking from " + customer.getName(),
            "Service: " + service.getTitle(),
            booking.getId()
        );
        return ServiceDto.BookingResponse.from(booking);
    }

    @Transactional(readOnly = true)
    public Page<ServiceDto.BookingResponse> getMyBookings(int page, int size) {
        User me = userService.currentUser();
        return bookingRepo
                .findByCustomerIdOrderByCreatedAtDesc(me.getId(), PageRequest.of(page, size))
                .map(ServiceDto.BookingResponse::from);
    }

    @Transactional
    public ServiceDto.BookingResponse updateBookingStatus(Long bookingId, BookingStatus newStatus) {
        User me = userService.currentUser();
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> ApiException.notFound("Booking not found"));

        // Only the service provider can update status
        if (!booking.getService().getProvider().getId().equals(me.getId())) {
            throw ApiException.forbidden("Only the provider can update booking status");
        }
        booking.setStatus(newStatus);
        booking = bookingRepo.save(booking);

        notificationService.send(
            booking.getCustomer().getId(), NotificationType.BOOKING_UPDATE,
            "Booking " + newStatus.name().toLowerCase(),
            "Your booking for " + booking.getService().getTitle() + " is now " + newStatus,
            booking.getId()
        );
        return ServiceDto.BookingResponse.from(booking);
    }
}
