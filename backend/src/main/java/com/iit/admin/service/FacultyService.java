package com.iit.admin.service;

import com.iit.admin.dto.FacultyDTO;
import com.iit.admin.entity.Faculty;
import com.iit.admin.entity.User;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public Page<FacultyDTO> searchFaculty(String department, String query, Pageable pageable) {
        return facultyRepository.searchFaculty(department, query, pageable)
                .map(this::mapToDTO);
    }

    public FacultyDTO getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty member not found with ID: " + id));
        return mapToDTO(faculty);
    }

    public FacultyDTO getFacultyByUsername(String username) {
        Faculty faculty = facultyRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + username));
        return mapToDTO(faculty);
    }

    @Transactional
    public FacultyDTO updateFaculty(Long id, FacultyDTO facultyDTO, String adminUsername, String ipAddress) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty member not found with ID: " + id));

        faculty.setName(facultyDTO.getName());
        faculty.setDepartment(facultyDTO.getDepartment());
        faculty.setPhone(facultyDTO.getPhone());
        faculty.setDesignation(facultyDTO.getDesignation());

        // Update corresponding User email
        User user = faculty.getUser();
        if (!user.getEmail().equals(facultyDTO.getEmail())) {
            user.setEmail(facultyDTO.getEmail());
            faculty.setEmail(facultyDTO.getEmail());
            userRepository.save(user);
        }

        Faculty updatedFaculty = facultyRepository.save(faculty);
        activityLogService.log(adminUsername, "UPDATE_FACULTY", "Updated faculty profile: " + faculty.getName(), ipAddress);

        return mapToDTO(updatedFaculty);
    }

    @Transactional
    public void deleteFaculty(Long id, String adminUsername, String ipAddress) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty member not found with ID: " + id));

        User user = faculty.getUser();
        facultyRepository.delete(faculty);
        userRepository.delete(user);

        activityLogService.log(adminUsername, "DELETE_FACULTY", "Deleted faculty profile and user: " + faculty.getName(), ipAddress);
    }

    private FacultyDTO mapToDTO(Faculty faculty) {
        FacultyDTO dto = new FacultyDTO();
        dto.setId(faculty.getId());
        dto.setUserId(faculty.getUser().getId());
        dto.setUsername(faculty.getUser().getUsername());
        dto.setName(faculty.getName());
        dto.setDepartment(faculty.getDepartment());
        dto.setEmail(faculty.getEmail());
        dto.setPhone(faculty.getPhone());
        dto.setDesignation(faculty.getDesignation());
        return dto;
    }
}
