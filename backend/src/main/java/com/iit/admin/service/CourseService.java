package com.iit.admin.service;

import com.iit.admin.dto.CourseDTO;
import com.iit.admin.dto.SyllabusDTO;
import com.iit.admin.entity.Course;
import com.iit.admin.entity.Department;
import com.iit.admin.entity.Faculty;
import com.iit.admin.entity.Syllabus;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.CourseRepository;
import com.iit.admin.repository.DepartmentRepository;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.SyllabusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SyllabusRepository syllabusRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<CourseDTO> getCoursesByDepartment(Long departmentId) {
        return courseRepository.findByDepartmentId(departmentId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<CourseDTO> getCoursesByDepartmentAndSemester(Long departmentId, Integer semester) {
        return courseRepository.findByDepartmentIdAndSemester(departmentId, semester).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + id));
        return mapToDTO(course);
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO dto) {
        if (courseRepository.findByCourseCode(dto.getCourseCode()).isPresent()) {
            throw new BadRequestException("Course code already exists!");
        }
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        Course course = new Course();
        course.setCourseCode(dto.getCourseCode());
        course.setTitle(dto.getTitle());
        course.setSemester(dto.getSemester());
        course.setCredits(dto.getCredits());
        course.setDepartment(dept);
        
        if (dto.getFacultyId() != null) {
            Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));
            course.setFaculty(faculty);
        } else {
            course.setFaculty(null);
        }
        
        return mapToDTO(courseRepository.save(course));
    }

    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + id));
        
        courseRepository.findByCourseCode(dto.getCourseCode()).ifPresent(c -> {
            if (!c.getId().equals(id)) {
                throw new BadRequestException("Course code already exists!");
            }
        });
        
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        course.setCourseCode(dto.getCourseCode());
        course.setTitle(dto.getTitle());
        course.setSemester(dto.getSemester());
        course.setCredits(dto.getCredits());
        course.setDepartment(dept);
        
        if (dto.getFacultyId() != null) {
            Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));
            course.setFaculty(faculty);
        } else {
            course.setFaculty(null);
        }
        
        return mapToDTO(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with ID: " + id);
        }
        courseRepository.deleteById(id);
    }

    // Syllabus Management
    public SyllabusDTO getSyllabusByCourseId(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        
        Syllabus syllabus = syllabusRepository.findByCourseId(courseId)
                .orElseGet(() -> {
                    Syllabus newSyllabus = new Syllabus();
                    newSyllabus.setCourse(course);
                    newSyllabus.setDescription("");
                    newSyllabus.setObjectives("");
                    newSyllabus.setUnits("[]");
                    newSyllabus.setTextbooks("");
                    return newSyllabus;
                });
        
        return mapToSyllabusDTO(syllabus);
    }

    @Transactional
    public SyllabusDTO saveSyllabus(Long courseId, SyllabusDTO dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        
        Syllabus syllabus = syllabusRepository.findByCourseId(courseId)
                .orElse(new Syllabus());
        
        syllabus.setCourse(course);
        syllabus.setDescription(dto.getDescription());
        syllabus.setObjectives(dto.getObjectives());
        syllabus.setUnits(dto.getUnits());
        syllabus.setTextbooks(dto.getTextbooks());
        
        return mapToSyllabusDTO(syllabusRepository.save(syllabus));
    }

    private CourseDTO mapToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setDepartmentId(course.getDepartment().getId());
        dto.setDepartmentName(course.getDepartment().getName());
        dto.setDepartmentCode(course.getDepartment().getCode());
        dto.setCourseCode(course.getCourseCode());
        dto.setTitle(course.getTitle());
        dto.setSemester(course.getSemester());
        dto.setCredits(course.getCredits());
        if (course.getFaculty() != null) {
            dto.setFacultyId(course.getFaculty().getId());
            dto.setFacultyName(course.getFaculty().getName());
        }
        return dto;
    }

    private SyllabusDTO mapToSyllabusDTO(Syllabus syllabus) {
        SyllabusDTO dto = new SyllabusDTO();
        dto.setId(syllabus.getId());
        dto.setCourseId(syllabus.getCourse().getId());
        dto.setCourseCode(syllabus.getCourse().getCourseCode());
        dto.setCourseTitle(syllabus.getCourse().getTitle());
        dto.setDescription(syllabus.getDescription());
        dto.setObjectives(syllabus.getObjectives());
        dto.setUnits(syllabus.getUnits());
        dto.setTextbooks(syllabus.getTextbooks());
        return dto;
    }

    public List<CourseDTO> getCoursesByFacultyUsername(String username) {
        Faculty faculty = facultyRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + username));
        return courseRepository.findByFacultyId(faculty.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}
