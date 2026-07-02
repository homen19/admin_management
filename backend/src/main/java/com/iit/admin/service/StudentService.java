package com.iit.admin.service;

import com.iit.admin.dto.StudentDTO;
import com.iit.admin.entity.Department;
import com.iit.admin.repository.DepartmentRepository;
import com.iit.admin.entity.Student;
import com.iit.admin.entity.User;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.StudentRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public Page<StudentDTO> searchStudents(String department, String query, Pageable pageable) {
        return studentRepository.searchStudents(department, query, pageable)
                .map(this::mapToDTO);
    }

    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        return mapToDTO(student);
    }

    public StudentDTO getStudentByUsername(String username) {
        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + username));
        return mapToDTO(student);
    }

    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO, String adminUsername, String ipAddress) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        student.setName(studentDTO.getName());
        
        Department dept = departmentRepository.findByCode(studentDTO.getDepartment())
                .or(() -> departmentRepository.findByName(studentDTO.getDepartment()))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + studentDTO.getDepartment()));
        student.setDepartment(dept);
        
        student.setPhone(studentDTO.getPhone());
        student.setSemester(studentDTO.getSemester());

        // Update corresponding User email
        User user = student.getUser();
        if (!user.getEmail().equals(studentDTO.getEmail())) {
            user.setEmail(studentDTO.getEmail());
            student.setEmail(studentDTO.getEmail());
            userRepository.save(user);
        }

        Student updatedStudent = studentRepository.save(student);
        activityLogService.log(adminUsername, "UPDATE_STUDENT", "Updated student profile for roll number: " + student.getRollNumber(), ipAddress);

        return mapToDTO(updatedStudent);
    }

    @Transactional
    public void deleteStudent(Long id, String adminUsername, String ipAddress) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        
        User user = student.getUser();
        studentRepository.delete(student);
        userRepository.delete(user);

        activityLogService.log(adminUsername, "DELETE_STUDENT", "Deleted student profile and user for roll number: " + student.getRollNumber(), ipAddress);
    }

    private StudentDTO mapToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setUserId(student.getUser().getId());
        dto.setUsername(student.getUser().getUsername());
        dto.setRollNumber(student.getRollNumber());
        dto.setName(student.getName());
        dto.setDepartment(student.getDepartment().getName());
        dto.setEmail(student.getEmail());
        dto.setPhone(student.getPhone());
        dto.setSemester(student.getSemester());
        return dto;
    }
}
