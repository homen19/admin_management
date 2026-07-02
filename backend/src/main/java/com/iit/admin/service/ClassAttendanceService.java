package com.iit.admin.service;

import com.iit.admin.dto.ClassAttendanceDTO;
import com.iit.admin.dto.ClassAttendanceSubmitDTO;
import com.iit.admin.dto.ClassSessionDTO;
import com.iit.admin.entity.*;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClassAttendanceService {

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private ClassAttendanceRepository classAttendanceRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Transactional
    public ClassSessionDTO scheduleSession(ClassSessionDTO dto, String facultyUsername) {
        Faculty faculty = facultyRepository.findByUserUsername(facultyUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + facultyUsername));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + dto.getCourseId()));

        if (course.getFaculty() == null || !course.getFaculty().getId().equals(faculty.getId())) {
            throw new BadRequestException("You are not assigned to teach this course!");
        }

        ClassSession session = new ClassSession();
        session.setCourse(course);
        session.setFaculty(faculty);
        session.setSessionDate(dto.getSessionDate() != null ? dto.getSessionDate() : LocalDate.now());
        session.setStartTime(dto.getStartTime() != null ? dto.getStartTime() : LocalTime.now());
        session.setEndTime(dto.getEndTime() != null ? dto.getEndTime() : LocalTime.now().plusHours(1));
        session.setTopicCovered(dto.getTopicCovered());

        ClassSession saved = classSessionRepository.save(session);
        return mapToSessionDTO(saved);
    }

    public List<ClassSessionDTO> getSessionsByCourse(Long courseId) {
        return classSessionRepository.findByCourseIdOrderBySessionDateDescStartTimeDesc(courseId)
                .stream().map(this::mapToSessionDTO).collect(Collectors.toList());
    }

    public List<ClassSessionDTO> getSessionsByFaculty(String facultyUsername) {
        Faculty faculty = facultyRepository.findByUserUsername(facultyUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + facultyUsername));
        return classSessionRepository.findByFacultyIdOrderBySessionDateDescStartTimeDesc(faculty.getId())
                .stream().map(this::mapToSessionDTO).collect(Collectors.toList());
    }

    public List<ClassAttendanceDTO> getStudentsForAttendanceSheet(Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class session not found with ID: " + classSessionId));

        // Get all students enrolled in the course's department and semester
        List<Student> students = studentRepository.findByDepartmentIdAndSemester(
                session.getCourse().getDepartment().getId(),
                session.getCourse().getSemester()
        );

        // Fetch existing attendance records to map statuses if already marked
        List<ClassAttendance> existingList = classAttendanceRepository.findByClassSessionId(classSessionId);
        Map<Long, ClassAttendance> attendanceMap = existingList.stream()
                .collect(Collectors.toMap(ca -> ca.getStudent().getId(), ca -> ca));

        List<ClassAttendanceDTO> sheet = new ArrayList<>();
        for (Student s : students) {
            ClassAttendanceDTO dto = new ClassAttendanceDTO();
            dto.setClassSessionId(classSessionId);
            dto.setStudentId(s.getId());
            dto.setStudentRollNumber(s.getRollNumber());
            dto.setStudentName(s.getName());

            if (attendanceMap.containsKey(s.getId())) {
                ClassAttendance ca = attendanceMap.get(s.getId());
                dto.setId(ca.getId());
                dto.setStatus(ca.getStatus());
                dto.setRemarks(ca.getRemarks());
            } else {
                dto.setStatus("PRESENT"); // Default status
                dto.setRemarks("");
            }
            sheet.add(dto);
        }

        // Sort by Roll Number for clean UI representation
        sheet.sort(Comparator.comparing(ClassAttendanceDTO::getStudentRollNumber));
        return sheet;
    }

    @Transactional
    public void submitAttendance(ClassAttendanceSubmitDTO submitDto) {
        ClassSession session = classSessionRepository.findById(submitDto.getClassSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Class session not found with ID: " + submitDto.getClassSessionId()));

        for (ClassAttendanceSubmitDTO.StudentAttendanceInput input : submitDto.getAttendanceList()) {
            Student student = studentRepository.findById(input.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + input.getStudentId()));

            ClassAttendance attendance = classAttendanceRepository.findByClassSessionIdAndStudentId(session.getId(), student.getId())
                    .orElse(new ClassAttendance());

            attendance.setClassSession(session);
            attendance.setStudent(student);
            attendance.setStatus(input.getStatus().toUpperCase());
            attendance.setRemarks(input.getRemarks());

            classAttendanceRepository.save(attendance);
        }
    }

    public List<Map<String, Object>> getStudentAttendanceSummary(String studentUsername, Integer semester) {
        Student student = studentRepository.findByUserUsername(studentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUsername));

        int targetSemester = semester != null ? semester : student.getSemester();

        // Find all courses for this student's department and semester
        List<Course> courses = courseRepository.findByDepartmentIdAndSemester(
                student.getDepartment().getId(),
                targetSemester
        );

        List<Map<String, Object>> summaries = new ArrayList<>();
        for (Course course : courses) {
            List<ClassSession> sessions = classSessionRepository.findByCourseId(course.getId());
            List<ClassAttendance> attendances = classAttendanceRepository.findByStudentIdAndClassSessionCourseId(student.getId(), course.getId());

            long totalSessions = sessions.size();
            long presentCount = attendances.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
            long absentCount = attendances.stream().filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus())).count();
            long lateCount = attendances.stream().filter(a -> "LATE".equalsIgnoreCase(a.getStatus())).count();

            double percentage = totalSessions > 0 ? ((double) (presentCount + lateCount) / totalSessions) * 100 : 100.0;

            Map<String, Object> summary = new HashMap<>();
            summary.put("courseId", course.getId());
            summary.put("courseCode", course.getCourseCode());
            summary.put("courseTitle", course.getTitle());
            summary.put("credits", course.getCredits());
            summary.put("totalSessions", totalSessions);
            summary.put("presentCount", presentCount);
            summary.put("absentCount", absentCount);
            summary.put("lateCount", lateCount);
            summary.put("percentage", Math.round(percentage * 100.0) / 100.0);

            summaries.add(summary);
        }

        return summaries;
    }

    public List<ClassAttendanceDTO> getStudentCourseAttendanceLogs(String studentUsername, Long courseId) {
        Student student = studentRepository.findByUserUsername(studentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUsername));

        return classAttendanceRepository.findByStudentIdAndClassSessionCourseId(student.getId(), courseId)
                .stream().map(this::mapToAttendanceDTO).collect(Collectors.toList());
    }

    private ClassSessionDTO mapToSessionDTO(ClassSession session) {
        ClassSessionDTO dto = new ClassSessionDTO();
        dto.setId(session.getId());
        dto.setCourseId(session.getCourse().getId());
        dto.setCourseCode(session.getCourse().getCourseCode());
        dto.setCourseTitle(session.getCourse().getTitle());
        dto.setSemester(session.getCourse().getSemester());
        dto.setFacultyId(session.getFaculty().getId());
        dto.setFacultyName(session.getFaculty().getName());
        dto.setSessionDate(session.getSessionDate());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setTopicCovered(session.getTopicCovered());
        return dto;
    }

    private ClassAttendanceDTO mapToAttendanceDTO(ClassAttendance ca) {
        ClassAttendanceDTO dto = new ClassAttendanceDTO();
        dto.setId(ca.getId());
        dto.setClassSessionId(ca.getClassSession().getId());
        dto.setSessionDate(ca.getClassSession().getSessionDate());
        dto.setTopicCovered(ca.getClassSession().getTopicCovered());
        dto.setStudentId(ca.getStudent().getId());
        dto.setStudentRollNumber(ca.getStudent().getRollNumber());
        dto.setStudentName(ca.getStudent().getName());
        dto.setStatus(ca.getStatus());
        dto.setRemarks(ca.getRemarks());
        return dto;
    }
}
