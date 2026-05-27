package com.iit.admin.service;

import com.iit.admin.dto.HolidayDTO;
import com.iit.admin.entity.Holiday;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HolidayService {

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public List<HolidayDTO> getAllHolidays() {
        return holidayRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<HolidayDTO> getHolidaysInRange(LocalDate start, LocalDate end) {
        return holidayRepository.findHolidaysInRange(start, end).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HolidayDTO createHoliday(HolidayDTO dto, String username, String ipAddress) {
        Holiday holiday = new Holiday();
        holiday.setTitle(dto.getTitle());
        holiday.setDescription(dto.getDescription());
        holiday.setHolidayDate(dto.getHolidayDate());
        holiday.setType(dto.getType());

        Holiday saved = holidayRepository.save(holiday);
        activityLogService.log(username, "CREATE_HOLIDAY", "Created holiday: " + saved.getTitle(), ipAddress);
        return mapToDTO(saved);
    }

    @Transactional
    public HolidayDTO updateHoliday(Long id, HolidayDTO dto, String username, String ipAddress) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with ID: " + id));

        holiday.setTitle(dto.getTitle());
        holiday.setDescription(dto.getDescription());
        holiday.setHolidayDate(dto.getHolidayDate());
        holiday.setType(dto.getType());

        Holiday updated = holidayRepository.save(holiday);
        activityLogService.log(username, "UPDATE_HOLIDAY", "Updated holiday: " + updated.getTitle(), ipAddress);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteHoliday(Long id, String username, String ipAddress) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with ID: " + id));

        holidayRepository.delete(holiday);
        activityLogService.log(username, "DELETE_HOLIDAY", "Deleted holiday: " + holiday.getTitle(), ipAddress);
    }

    private HolidayDTO mapToDTO(Holiday holiday) {
        HolidayDTO dto = new HolidayDTO();
        dto.setId(holiday.getId());
        dto.setTitle(holiday.getTitle());
        dto.setDescription(holiday.getDescription());
        dto.setHolidayDate(holiday.getHolidayDate());
        dto.setType(holiday.getType());
        return dto;
    }
}
