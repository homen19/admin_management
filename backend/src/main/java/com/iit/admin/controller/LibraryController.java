package com.iit.admin.controller;

import com.iit.admin.dto.BookIssueDTO;
import com.iit.admin.dto.LibraryCardDTO;
import com.iit.admin.entity.Book;
import com.iit.admin.entity.BookIssue;
import com.iit.admin.entity.LibraryCard;
import com.iit.admin.entity.Student;
import com.iit.admin.entity.Faculty;
import com.iit.admin.entity.User;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.repository.StudentRepository;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.UserRepository;
import com.iit.admin.service.LibraryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    @Autowired
    private LibraryService libraryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    // Books endpoints
    @GetMapping("/books")
    public ResponseEntity<Page<Book>> getBooks(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(libraryService.searchBooks(query, pageable));
    }

    @PostMapping("/books")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<Book> createBook(@Valid @RequestBody Book book) {
        return ResponseEntity.ok(libraryService.saveBook(book));
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @Valid @RequestBody Book book) {
        book.setId(id);
        return ResponseEntity.ok(libraryService.saveBook(book));
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        libraryService.deleteBook(id);
        return ResponseEntity.ok(Map.of("message", "Book deleted successfully."));
    }

    // Borrowings endpoints
    @PostMapping("/issue")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<BookIssueDTO> issueBook(
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String isbn = (String) requestBody.get("isbn");
        String username = (String) requestBody.get("username");
        Object daysToDueObj = requestBody.get("daysToDue");
        Integer daysToDue;
        
        if (daysToDueObj instanceof String) {
            daysToDue = Integer.parseInt((String) daysToDueObj);
        } else if (daysToDueObj instanceof Number) {
            daysToDue = ((Number) daysToDueObj).intValue();
        } else {
            daysToDue = 14; // Default to 14 days
        }
        
        if (isbn == null || username == null) {
            throw new BadRequestException("ISBN and username are required fields.");
        }

        String ipAddress = request.getRemoteAddr();
        BookIssue issue = libraryService.issueBook(isbn, username, daysToDue, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(mapToDTO(issue));
    }

    @PostMapping("/return/{issueId}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<BookIssueDTO> returnBook(
            @PathVariable Long issueId,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        BookIssue issue = libraryService.returnBook(issueId, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(mapToDTO(issue));
    }

    @PostMapping("/pay-fine/{issueId}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<BookIssueDTO> payFine(
            @PathVariable Long issueId,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        BookIssue issue = libraryService.payFine(issueId, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(mapToDTO(issue));
    }

    @GetMapping("/issues")
    public ResponseEntity<List<BookIssueDTO>> getIssues(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));

        List<BookIssue> issues;
        String role = user.getRole().getName();
        if ("ROLE_ADMIN".equals(role) || "ROLE_LIBRARIAN".equals(role)) {
            // Admin and Librarian see all issues
            issues = libraryService.getIssuesList(null);
        } else {
            // Student and Faculty see only their own issues
            issues = libraryService.getIssuesList(user.getId());
        }

        List<BookIssueDTO> dtos = issues.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private BookIssueDTO mapToDTO(BookIssue issue) {
        BookIssueDTO dto = new BookIssueDTO();
        dto.setId(issue.getId());
        dto.setBookId(issue.getBook().getId());
        dto.setBookTitle(issue.getBook().getTitle());
        dto.setBookIsbn(issue.getBook().getIsbn());
        dto.setBookAuthor(issue.getBook().getAuthor());
        dto.setUserId(issue.getUser().getId());
        dto.setUsername(issue.getUser().getUsername());
        dto.setUserEmail(issue.getUser().getEmail());
        dto.setIssueDate(issue.getIssueDate());
        dto.setDueDate(issue.getDueDate());
        dto.setReturnDate(issue.getReturnDate());
        dto.setStatus(issue.getStatus());
        dto.setFineAmount(issue.getFineAmount());
        dto.setFinePaid(issue.getFinePaid());
        
        // Calculate live accrued fine if past due date and not returned yet
        if ("ISSUED".equals(issue.getStatus()) && java.time.LocalDate.now().isAfter(issue.getDueDate())) {
            long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(issue.getDueDate(), java.time.LocalDate.now());
            dto.setCurrentFine(daysOverdue * 10.0);
        } else {
            dto.setCurrentFine(0.0);
        }
        
        dto.setIssuedByUsername(issue.getIssuedBy() != null ? issue.getIssuedBy().getUsername() : "N/A");
        dto.setCreatedAt(issue.getCreatedAt());

        // Resolve display name for the borrower
        String username = issue.getUser().getUsername();
        String roleName = issue.getUser().getRole().getName();
        if ("ROLE_STUDENT".equals(roleName)) {
            Optional<Student> student = studentRepository.findByUserUsername(username);
            dto.setBorrowerName(student.isPresent() ? student.get().getName() : username + " (Student)");
        } else if ("ROLE_FACULTY".equals(roleName)) {
            Optional<Faculty> faculty = facultyRepository.findByUserUsername(username);
            dto.setBorrowerName(faculty.isPresent() ? faculty.get().getName() : username + " (Faculty)");
        } else {
            dto.setBorrowerName(username);
        }

        return dto;
    }

    // --- Library Cards Endpoints ---

    @GetMapping("/cards")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<LibraryCardDTO>> getLibraryCards(@RequestParam(required = false, defaultValue = "") String query) {
        List<LibraryCard> cards = libraryService.searchCards(query);
        List<LibraryCardDTO> dtos = cards.stream().map(this::mapToCardDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/cards/generate")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<LibraryCardDTO> generateCard(
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (String) requestBody.get("username");
        Object validityYearsObj = requestBody.get("validityYears");
        int validityYears = 4; // Default to 4 years for B.Tech
        if (validityYearsObj instanceof Number) {
            validityYears = ((Number) validityYearsObj).intValue();
        } else if (validityYearsObj instanceof String) {
            validityYears = Integer.parseInt((String) validityYearsObj);
        }

        LibraryCard card = libraryService.generateCard(username, validityYears, userDetails.getUsername());
        return ResponseEntity.ok(mapToCardDTO(card));
    }

    @PutMapping("/cards/{cardId}/revoke")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<LibraryCardDTO> revokeCard(
            @PathVariable Long cardId,
            @AuthenticationPrincipal UserDetails userDetails) {
        LibraryCard card = libraryService.revokeCard(cardId, userDetails.getUsername());
        return ResponseEntity.ok(mapToCardDTO(card));
    }

    @GetMapping("/users/search")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, String>>> searchEligibleUsers(@RequestParam(required = false, defaultValue = "") String query) {
        // Find users with ROLE_STUDENT or ROLE_FACULTY matching the query
        String lowerQuery = query.toLowerCase();
        List<Map<String, String>> users = userRepository.findAll().stream()
                .filter(u -> "ROLE_STUDENT".equals(u.getRole().getName()) || "ROLE_FACULTY".equals(u.getRole().getName()))
                .filter(u -> u.getUsername().toLowerCase().contains(lowerQuery) || u.getEmail().toLowerCase().contains(lowerQuery))
                .map(u -> Map.of("username", u.getUsername(), "role", u.getRole().getName(), "email", u.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    private LibraryCardDTO mapToCardDTO(LibraryCard card) {
        LibraryCardDTO dto = new LibraryCardDTO();
        dto.setId(card.getId());
        dto.setCardNumber(card.getCardNumber());
        dto.setUserId(card.getUser().getId());
        dto.setUsername(card.getUser().getUsername());
        dto.setUserRole(card.getUser().getRole().getName());
        dto.setIssueDate(card.getIssueDate());
        dto.setValidUntil(card.getValidUntil());
        dto.setStatus(card.getStatus());
        dto.setIssuedByUsername(card.getIssuedBy().getUsername());
        dto.setCreatedAt(card.getCreatedAt());

        // Resolve display name
        if ("ROLE_STUDENT".equals(dto.getUserRole())) {
            studentRepository.findByUserUsername(dto.getUsername())
                    .ifPresent(student -> dto.setUserFullName(student.getName()));
        } else if ("ROLE_FACULTY".equals(dto.getUserRole())) {
            facultyRepository.findByUserUsername(dto.getUsername())
                    .ifPresent(faculty -> dto.setUserFullName(faculty.getName()));
        }
        if (dto.getUserFullName() == null) {
            dto.setUserFullName(dto.getUsername());
        }

        return dto;
    }
}
