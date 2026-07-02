package com.iit.admin.service;

import com.iit.admin.dto.SchoolDTO;
import com.iit.admin.entity.School;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchoolService {

    @Autowired
    private SchoolRepository schoolRepository;

    public List<SchoolDTO> getAllSchools() {
        return schoolRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public SchoolDTO getSchoolById(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School not found with ID: " + id));
        return mapToDTO(school);
    }

    @Transactional
    public SchoolDTO createSchool(SchoolDTO dto) {
        if (schoolRepository.findByCode(dto.getCode()).isPresent()) {
            throw new BadRequestException("School code already exists!");
        }
        if (schoolRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("School name already exists!");
        }
        School school = new School();
        school.setName(dto.getName());
        school.setCode(dto.getCode());
        return mapToDTO(schoolRepository.save(school));
    }

    @Transactional
    public SchoolDTO updateSchool(Long id, SchoolDTO dto) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School not found with ID: " + id));
        
        schoolRepository.findByCode(dto.getCode()).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new BadRequestException("School code already exists!");
            }
        });
        schoolRepository.findByName(dto.getName()).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new BadRequestException("School name already exists!");
            }
        });

        school.setName(dto.getName());
        school.setCode(dto.getCode());
        return mapToDTO(schoolRepository.save(school));
    }

    @Transactional
    public void deleteSchool(Long id) {
        if (!schoolRepository.existsById(id)) {
            throw new ResourceNotFoundException("School not found with ID: " + id);
        }
        schoolRepository.deleteById(id);
    }

    private SchoolDTO mapToDTO(School school) {
        SchoolDTO dto = new SchoolDTO();
        dto.setId(school.getId());
        dto.setName(school.getName());
        dto.setCode(school.getCode());
        return dto;
    }
}
