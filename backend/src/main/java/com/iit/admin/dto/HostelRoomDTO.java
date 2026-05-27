package com.iit.admin.dto;

import lombok.Data;

@Data
public class HostelRoomDTO {
    private Long id;
    private Long hostelId;
    private String hostelName;
    private String roomNumber;
    private String sharingType;
    private Integer capacity;
    private Double rent;
    private Integer occupiedCount;
}
