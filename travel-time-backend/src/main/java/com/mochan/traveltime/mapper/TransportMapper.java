package com.mochan.traveltime.mapper;

import com.mochan.traveltime.dto.transport.create.CreateTransportRequest;
import com.mochan.traveltime.dto.transport.get.TransportResponse;
import com.mochan.traveltime.dto.transport.update.UpdateTransportRequest;
import com.mochan.traveltime.model.Transport;
import org.springframework.stereotype.Component;

@Component
public class TransportMapper {

    public TransportResponse transportToTransportResponse(Transport transport) {
        return TransportResponse.builder()
                .transportId(transport.getTransportId())
                .transportName(transport.getTransportName())
                .transportNumber(transport.getTransportNumber())
                .description(transport.getDescription())
                .build();
    }

    public Transport toTransport(CreateTransportRequest createTransportRequest) {
        return Transport.builder()
                .transportName(createTransportRequest.getTransportName())
                .transportNumber(createTransportRequest.getTransportNumber())
                .description(createTransportRequest.getDescription())
                .build();
    }

    public void updateTransportFromRequest(UpdateTransportRequest updateTransportRequest, Transport transport) {
        if (updateTransportRequest == null) {
            return;
        }

        transport.setTransportName(updateTransportRequest.getTransportName());
        transport.setTransportNumber(updateTransportRequest.getTransportNumber());
        transport.setDescription(updateTransportRequest.getDescription());
    }
}
