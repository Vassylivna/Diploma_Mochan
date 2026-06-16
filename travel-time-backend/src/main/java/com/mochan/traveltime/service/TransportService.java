package com.mochan.traveltime.service;

import com.mochan.traveltime.dto.transport.create.CreateTransportRequest;
import com.mochan.traveltime.dto.transport.get.TransportResponse;
import com.mochan.traveltime.dto.transport.update.UpdateTransportRequest;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.exception.TransportNotFoundException;
import com.mochan.traveltime.mapper.TransportMapper;
import com.mochan.traveltime.model.Transport;
import com.mochan.traveltime.repository.TourRepository;
import com.mochan.traveltime.repository.TransportRepository;
import com.mochan.traveltime.specification.TransportSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class TransportService {

    private final TransportRepository transportRepository;
    private final TourRepository tourRepository;
    private final TransportMapper transportMapper;

    public Page<TransportResponse> getTransports(String searchTerm, Pageable pageable) {
        log.info("Fetching paginated transports. Search term: {}", searchTerm);

        Specification<Transport> specification = TransportSpecifications.withFilter(searchTerm);
        Page<Transport> transportPage = transportRepository.findAll(specification, pageable);
        List<TransportResponse> transportResponseList = new ArrayList<>();

        for (Transport transport : transportPage.getContent()) {
            TransportResponse transportResponse = transportMapper.transportToTransportResponse(transport);
            transportResponseList.add(transportResponse);
        }

        return new PageImpl<>(transportResponseList, pageable, transportPage.getTotalElements());
    }

    public List<TransportResponse> getAllActiveTransports(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching all active transports. Start date: {}, End date: {}", startDate, endDate);

        Specification<Transport> specification = TransportSpecifications.withAvailability(startDate, endDate);
        Sort sort = Sort.by(Sort.Direction.ASC, "transportName");
        List<Transport> transports = transportRepository.findAll(specification, sort);
        List<TransportResponse> transportResponseList = new ArrayList<>();

        for (Transport transport : transports) {
            TransportResponse dto = transportMapper.transportToTransportResponse(transport);
            transportResponseList.add(dto);
        }

        return transportResponseList;
    }

    public TransportResponse createTransport(CreateTransportRequest createTransportRequest) {
        log.info("Processing create transport request");

        Transport newTransport = transportMapper.toTransport(createTransportRequest);
        newTransport.setIsDeleted(false);
        Transport savedTransport = transportRepository.save(newTransport);

        log.info("Successfully created transport ID: {}", savedTransport.getTransportId());
        return transportMapper.transportToTransportResponse(savedTransport);
    }

    public TransportResponse updateTransport(Long transportId, UpdateTransportRequest updateTransportRequest) {
        log.info("Processing update for transport ID: {}", transportId);

        Transport transport = transportRepository.findById(transportId)
                .orElseThrow(() -> {
                    log.warn("Update transport failed: Transport ID {} not found", transportId);
                    return new TransportNotFoundException("Транспорт з Id " + transportId + " не знайдено");
                });

        transportMapper.updateTransportFromRequest(updateTransportRequest, transport);
        Transport updatedTransport = transportRepository.save(transport);

        log.info("Successfully updated transport ID: {}", updatedTransport.getTransportId());
        return transportMapper.transportToTransportResponse(updatedTransport);
    }

    public void deleteTransport(Long id) {
        log.info("Processing delete for transport ID: {}", id);

        if (!transportRepository.existsById(id)) {
            log.warn("Delete transport failed: Transport ID {} not found", id);
            throw new TransportNotFoundException("Транспорт з Id " + id + " не знайдено");
        }

        boolean isUsed = tourRepository.existsActiveTourWithTransport(id);

        if (isUsed) {
            log.warn("Delete transport failed: Transport ID {} is currently used in active or future tours", id);
            throw new ResourceConflictException("Неможливо видалити транспорт, оскільки він використовується в активних або майбутніх турах");
        }

        transportRepository.softDeleteById(id);
        log.info("Successfully soft-deleted transport ID: {}", id);
    }
}