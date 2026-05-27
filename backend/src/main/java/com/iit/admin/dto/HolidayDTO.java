package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class HolidayDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate holidayDate;
    private String type; // NATIONAL, REGIONAL, ACADEMIC
}
