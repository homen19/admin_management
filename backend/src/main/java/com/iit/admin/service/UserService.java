package com.iit.admin.service;

import com.iit.admin.dto.JwtResponse;
import com.iit.admin.dto.LoginRequest;
import com.iit.admin.dto.RegisterRequest;
import com.iit.admin.dto.UserDTO;
import com.iit.admin.dto.UserProfileDTO;
import com.iit.admin.entity.Faculty;
import com.iit.admin.entity.Role;
import com.iit.admin.entity.Student;
import com.iit.admin.entity.User;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.entity.Department;
import com.iit.admin.repository.DepartmentRepository;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.RoleRepository;
import com.iit.admin.repository.StudentRepository;
import com.iit.admin.repository.UserRepository;
import com.iit.admin.entity.Librarian;
import com.iit.admin.repository.LibrarianRepository;
import com.iit.admin.security.JwtTokenProvider;
import com.iit.admin.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private LibrarianRepository librarianRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ActivityLogService activityLogService;

    public JwtResponse authenticateUser(LoginRequest loginRequest, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        activityLogService.log(userPrincipal.getUsername(), "USER_LOGIN", "Logged into system", ipAddress);

        return new JwtResponse(
                jwt,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                userPrincipal.getAuthorities().iterator().next().getAuthority()
        );
    }

    @Transactional
    public User registerUser(RegisterRequest registerRequest, String ipAddress) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (!isAdmin && !"ROLE_STUDENT".equals(registerRequest.getRole())) {
                throw new BadRequestException("Staff members are only allowed to register student profiles!");
            }
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        Role role = roleRepository.findByName(registerRequest.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + registerRequest.getRole()));

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(role);
        
        User savedUser = userRepository.save(user);

        if ("ROLE_STUDENT".equals(role.getName())) {
            if (registerRequest.getDepartment() == null || registerRequest.getDepartment().trim().isEmpty()) {
                throw new BadRequestException("Department is required for student registration!");
            }
            if (registerRequest.getRollNumber() == null || registerRequest.getSemester() == null) {
                throw new BadRequestException("Roll number and Semester are required for student registration!");
            }
            if (studentRepository.findByRollNumber(registerRequest.getRollNumber()).isPresent()) {
                throw new BadRequestException("Roll number is already in use!");
            }
            Student student = new Student();
            student.setUser(savedUser);
            student.setRollNumber(registerRequest.getRollNumber());
            student.setName(registerRequest.getName());
            Department dept = departmentRepository.findByCode(registerRequest.getDepartment())
                    .or(() -> departmentRepository.findByName(registerRequest.getDepartment()))
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + registerRequest.getDepartment()));
            student.setDepartment(dept);
            student.setEmail(registerRequest.getEmail());
            student.setPhone(registerRequest.getPhone());
            student.setSemester(registerRequest.getSemester());
            studentRepository.save(student);
            
        } else if ("ROLE_FACULTY".equals(role.getName())) {
            if (registerRequest.getDepartment() == null || registerRequest.getDepartment().trim().isEmpty()) {
                throw new BadRequestException("Department is required for faculty registration!");
            }
            if (registerRequest.getDesignation() == null) {
                throw new BadRequestException("Designation is required for faculty registration!");
            }
            Faculty faculty = new Faculty();
            faculty.setUser(savedUser);
            faculty.setName(registerRequest.getName());
            Department dept = departmentRepository.findByCode(registerRequest.getDepartment())
                    .or(() -> departmentRepository.findByName(registerRequest.getDepartment()))
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + registerRequest.getDepartment()));
            faculty.setDepartment(dept);
            faculty.setEmail(registerRequest.getEmail());
            faculty.setPhone(registerRequest.getPhone());
            faculty.setDesignation(registerRequest.getDesignation());
            facultyRepository.save(faculty);
        } else if ("ROLE_LIBRARIAN".equals(role.getName())) {
            if (registerRequest.getEmployeeId() == null || registerRequest.getEmployeeId().trim().isEmpty()) {
                throw new BadRequestException("Employee ID is required for librarian registration!");
            }
            if (librarianRepository.findByEmployeeId(registerRequest.getEmployeeId()).isPresent()) {
                throw new BadRequestException("Employee ID is already in use!");
            }
            Librarian librarian = new Librarian();
            librarian.setUser(savedUser);
            librarian.setName(registerRequest.getName());
            librarian.setEmployeeId(registerRequest.getEmployeeId());
            librarian.setEmail(registerRequest.getEmail());
            librarian.setPhone(registerRequest.getPhone());
            librarianRepository.save(librarian);
        }
        // ROLE_ADMIN, ROLE_STAFF, ROLE_FINANCE: no separate profile table needed

        activityLogService.log(null, "REGISTER_USER", "Registered new user: " + user.getUsername() + " as " + role.getName(), ipAddress);

        return savedUser;
    }

    public Page<UserDTO> getAllUsers(String query, Pageable pageable) {
        return userRepository.searchUsers(query, pageable).map(this::mapToUserDTO);
    }

    @Transactional
    public void changeUserPassword(Long userId, String newPassword, String adminUsername, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        activityLogService.log(adminUsername, "CHANGE_PASSWORD", "Admin reset password for user: " + user.getUsername(), ipAddress);
    }

    @Transactional
    public void deleteUser(Long userId, String adminUsername, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        if ("ROLE_STUDENT".equals(user.getRole().getName())) {
            studentRepository.findByUserUsername(user.getUsername()).ifPresent(student -> {
                studentRepository.delete(student);
            });
        } else if ("ROLE_FACULTY".equals(user.getRole().getName())) {
            facultyRepository.findByUserUsername(user.getUsername()).ifPresent(faculty -> {
                facultyRepository.delete(faculty);
            });
        } else if ("ROLE_LIBRARIAN".equals(user.getRole().getName())) {
            librarianRepository.findByUserUsername(user.getUsername()).ifPresent(librarian -> {
                librarianRepository.delete(librarian);
            });
        }
        
        if (userRepository.existsById(userId)) {
            userRepository.delete(user);
        }
        
        activityLogService.log(adminUsername, "DELETE_USER", "Admin deleted user: " + user.getUsername(), ipAddress);
    }

    public UserProfileDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        UserProfileDTO profile = new UserProfileDTO();
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setRole(user.getRole().getName());
        
        if ("ROLE_STUDENT".equals(user.getRole().getName())) {
            Student student = studentRepository.findByUserUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + username));
            profile.setName(student.getName());
            profile.setPhone(student.getPhone());
            profile.setDepartment(student.getDepartment().getName());
            profile.setRollNumber(student.getRollNumber());
            profile.setSemester(student.getSemester());
        } else if ("ROLE_FACULTY".equals(user.getRole().getName())) {
            Faculty faculty = facultyRepository.findByUserUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + username));
            profile.setName(faculty.getName());
            profile.setPhone(faculty.getPhone());
            profile.setDepartment(faculty.getDepartment().getName());
            profile.setDesignation(faculty.getDesignation());
        } else if ("ROLE_LIBRARIAN".equals(user.getRole().getName())) {
            Librarian librarian = librarianRepository.findByUserUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Librarian profile not found for user: " + username));
            profile.setName(librarian.getName());
            profile.setPhone(librarian.getPhone());
            profile.setEmployeeId(librarian.getEmployeeId());
        } else {
            // ROLE_ADMIN, ROLE_STAFF, ROLE_FINANCE: no separate profile table needed
            profile.setName(user.getUsername());
        }
        
        return profile;
    }

    @Transactional
    public UserProfileDTO updateUserProfile(String username, UserProfileDTO profileDTO, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        if (profileDTO.getEmail() != null && !profileDTO.getEmail().isEmpty()) {
            if (!user.getEmail().equals(profileDTO.getEmail())) {
                if (userRepository.existsByEmail(profileDTO.getEmail())) {
                    throw new BadRequestException("Email is already in use by another user!");
                }
                user.setEmail(profileDTO.getEmail());
            }
        }
        
        if ("ROLE_STUDENT".equals(user.getRole().getName())) {
            Student student = studentRepository.findByUserUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + username));
            student.setName(profileDTO.getName());
            student.setPhone(profileDTO.getPhone());
            
            Department dept = departmentRepository.findByCode(profileDTO.getDepartment())

                    .or(() -> departmentRepository.findByName(profileDTO.getDepartment()))
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + profileDTO.getDepartment()));
            student.setDepartment(dept);
            
            student.setEmail(user.getEmail());
            studentRepository.save(student);
        } else if ("ROLE_FACULTY".equals(user.getRole().getName())) {
            Faculty faculty = facultyRepository.findByUserUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + username));
            faculty.setName(profileDTO.getName());
            faculty.setPhone(profileDTO.getPhone());
            
            Department dept = departmentRepository.findByCode(profileDTO.getDepartment())
                    .or(() -> departmentRepository.findByName(profileDTO.getDepartment()))
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + profileDTO.getDepartment()));
            faculty.setDepartment(dept);
            
            faculty.setEmail(user.getEmail());
            facultyRepository.save(faculty);
        } else if ("ROLE_LIBRARIAN".equals(user.getRole().getName())) {
            Librarian librarian = librarianRepository.findByUserUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Librarian profile not found for user: " + username));
            librarian.setName(profileDTO.getName());
            librarian.setPhone(profileDTO.getPhone());
            librarian.setEmail(user.getEmail());
            librarianRepository.save(librarian);
        }
        
        userRepository.save(user);
        activityLogService.log(username, "UPDATE_PROFILE", "Updated personal profile details", ipAddress);
        
        return getUserProfile(username);
    }

    @Transactional
    public void updateProfilePassword(String username, String oldPassword, String newPassword, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Current password does not match!");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        activityLogService.log(username, "CHANGE_PASSWORD", "User updated their own password", ipAddress);
    }

    private UserDTO mapToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRoleName(user.getRole().getName());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        if ("ROLE_STUDENT".equals(user.getRole().getName())) {
            studentRepository.findByUserUsername(user.getUsername())
                .ifPresent(s -> dto.setName(s.getName()));
        } else if ("ROLE_FACULTY".equals(user.getRole().getName())) {
            facultyRepository.findByUserUsername(user.getUsername())
                .ifPresent(f -> dto.setName(f.getName()));
        } else if ("ROLE_LIBRARIAN".equals(user.getRole().getName())) {
            librarianRepository.findByUserUsername(user.getUsername())
                .ifPresent(l -> dto.setName(l.getName()));
        } else {
            // ROLE_ADMIN, ROLE_STAFF, ROLE_FINANCE – no profile table
            dto.setName(user.getUsername());
        }
        return dto;
    }
}
