package com.iit.admin.service;

import com.iit.admin.dto.DepartmentDTO;
import com.iit.admin.entity.Department;
import com.iit.admin.entity.School;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.DepartmentRepository;
import com.iit.admin.repository.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<DepartmentDTO> getDepartmentsBySchool(Long schoolId) {
        return departmentRepository.findBySchoolId(schoolId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return mapToDTO(department);
    }

    @Transactional
    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        if (departmentRepository.findByCode(dto.getCode()).isPresent()) {
            throw new BadRequestException("Department code already exists!");
        }
        if (departmentRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Department name already exists!");
        }
        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found with ID: " + dto.getSchoolId()));

        Department department = new Department();
        department.setName(dto.getName());
        department.setCode(dto.getCode());
        department.setSchool(school);
        return mapToDTO(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        
        departmentRepository.findByCode(dto.getCode()).ifPresent(d -> {
            if (!d.getId().equals(id)) {
                throw new BadRequestException("Department code already exists!");
            }
        });
        departmentRepository.findByName(dto.getName()).ifPresent(d -> {
            if (!d.getId().equals(id)) {
                throw new BadRequestException("Department name already exists!");
            }
        });

        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found with ID: " + dto.getSchoolId()));

        department.setName(dto.getName());
        department.setCode(dto.getCode());
        department.setSchool(school);
        return mapToDTO(departmentRepository.save(department));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with ID: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentDTO mapToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setSchoolId(department.getSchool().getId());
        dto.setSchoolName(department.getSchool().getName());
        dto.setName(department.getName());
        dto.setCode(department.getCode());
        return dto;
    }
}
