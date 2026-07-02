package com.iit.admin.service;

import com.iit.admin.entity.Book;
import com.iit.admin.entity.BookIssue;
import com.iit.admin.entity.User;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.BookIssueRepository;
import com.iit.admin.repository.BookRepository;
import com.iit.admin.repository.LibraryCardRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class LibraryService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookIssueRepository bookIssueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LibraryCardRepository libraryCardRepository;

    @Autowired
    private ActivityLogService activityLogService;

    // Books CRUD
    @Transactional(readOnly = true)
    public Page<Book> searchBooks(String query, Pageable pageable) {
        return bookRepository.searchBooks(query, pageable);
    }

    @Transactional(readOnly = true)
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));
    }

    @Transactional
    public Book saveBook(Book book) {
        if (book.getId() == null) {
            // New book
            if (bookRepository.findByIsbn(book.getIsbn()).isPresent()) {
                throw new BadRequestException("Book with ISBN " + book.getIsbn() + " already exists!");
            }
            // Set copies available equal to total copies on create
            book.setCopiesAvailable(book.getCopiesTotal());
        } else {
            // Update book - ensure available copies are updated correctly if total copies changed
            Book existing = getBookById(book.getId());
            int totalDiff = book.getCopiesTotal() - existing.getCopiesTotal();
            book.setCopiesAvailable(existing.getCopiesAvailable() + totalDiff);
            if (book.getCopiesAvailable() < 0) {
                throw new BadRequestException("Cannot reduce total copies because books are currently issued!");
            }
        }
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBookById(id);
        List<BookIssue> activeIssues = bookIssueRepository.findByBookId(id);
        boolean hasActive = activeIssues.stream().anyMatch(i -> "ISSUED".equals(i.getStatus()));
        if (hasActive) {
            throw new BadRequestException("Cannot delete book because it is currently issued to students/faculty!");
        }
        bookRepository.delete(book);
    }

    // Issue Book
    @Transactional
    public BookIssue issueBook(String isbn, String username, int daysToDue, String librarianUsername, String ipAddress) {
        Book book = bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ISBN: " + isbn));

        if (book.getCopiesAvailable() <= 0) {
            throw new BadRequestException("No available copies of this book in stock!");
        }

        User borrower = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Borrower account not found with username: " + username));

        User librarian = userRepository.findByUsername(librarianUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Librarian account not found with username: " + librarianUsername));

        // Create issue record
        BookIssue issue = new BookIssue();
        issue.setBook(book);
        issue.setUser(borrower);
        issue.setIssueDate(LocalDate.now());
        issue.setDueDate(LocalDate.now().plusDays(daysToDue));
        issue.setStatus("ISSUED");
        issue.setIssuedBy(librarian);

        // Update book stock
        book.setCopiesAvailable(book.getCopiesAvailable() - 1);
        bookRepository.save(book);

        BookIssue saved = bookIssueRepository.save(issue);
        
        activityLogService.log(librarianUsername, "ISSUE_BOOK", 
                String.format("Issued book '%s' to user %s. Due Date: %s", book.getTitle(), username, issue.getDueDate()), 
                ipAddress);

        return saved;
    }

    // Return Book
    @Transactional
    public BookIssue returnBook(Long issueId, String librarianUsername, String ipAddress) {
        BookIssue issue = bookIssueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrowing record not found with ID: " + issueId));

        if ("RETURNED".equals(issue.getStatus())) {
            throw new BadRequestException("This book issue has already been marked as returned!");
        }

        Book book = issue.getBook();
        book.setCopiesAvailable(book.getCopiesAvailable() + 1);
        bookRepository.save(book);

        LocalDate returnDate = LocalDate.now();
        issue.setReturnDate(returnDate);
        issue.setStatus("RETURNED");

        // Calculate fine: 10rs per day if returned after due date
        if (returnDate.isAfter(issue.getDueDate())) {
            long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(issue.getDueDate(), returnDate);
            double fine = daysOverdue * 10.0;
            issue.setFineAmount(fine);
            issue.setFinePaid(false);
        } else {
            issue.setFineAmount(0.0);
            issue.setFinePaid(true);
        }
        
        BookIssue saved = bookIssueRepository.save(issue);

        activityLogService.log(librarianUsername, "RETURN_BOOK", 
                String.format("Marked book '%s' as returned by user %s. Fine: ₹%.2f", 
                        book.getTitle(), issue.getUser().getUsername(), issue.getFineAmount()), 
                ipAddress);

        return saved;
    }

    // Pay Fine
    @Transactional
    public BookIssue payFine(Long issueId, String librarianUsername, String ipAddress) {
        BookIssue issue = bookIssueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrowing record not found with ID: " + issueId));

        if (issue.getFinePaid()) {
            throw new BadRequestException("Fine is already paid or there is no fine for this issue!");
        }

        issue.setFinePaid(true);
        BookIssue saved = bookIssueRepository.save(issue);

        activityLogService.log(librarianUsername, "PAY_FINE", 
                String.format("Recorded fine payment of ₹%.2f for book '%s' borrowed by user %s", 
                        issue.getFineAmount(), issue.getBook().getTitle(), issue.getUser().getUsername()), 
                ipAddress);

        return saved;
    }

    // View Borrowings
    @Transactional(readOnly = true)
    public List<BookIssue> getIssuesList(Long userId) {
        return bookIssueRepository.searchIssues(userId);
    }

    // Library Cards
    @Transactional
    public com.iit.admin.entity.LibraryCard generateCard(String targetUsername, int validityYears, String librarianUsername) {
        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUsername));
        
        String role = targetUser.getRole().getName();
        if (!"ROLE_STUDENT".equals(role) && !"ROLE_FACULTY".equals(role)) {
            throw new BadRequestException("Library cards can only be issued to Students and Faculty.");
        }

        libraryCardRepository.findByUserIdAndStatus(targetUser.getId(), "ACTIVE").ifPresent(c -> {
            throw new BadRequestException("User already has an ACTIVE library card.");
        });

        User librarian = userRepository.findByUsername(librarianUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Librarian not found"));

        com.iit.admin.entity.LibraryCard card = new com.iit.admin.entity.LibraryCard();
        card.setUser(targetUser);
        card.setIssueDate(LocalDate.now());
        card.setValidUntil(LocalDate.now().plusYears(validityYears));
        card.setIssuedBy(librarian);
        
        // Generate a random card number LIB-YYYY-RND
        String randomSuffix = String.format("%04d", new java.util.Random().nextInt(10000));
        card.setCardNumber("LIB-" + LocalDate.now().getYear() + "-" + randomSuffix);
        
        com.iit.admin.entity.LibraryCard saved = libraryCardRepository.save(card);
        
        activityLogService.log(librarianUsername, "GENERATE_CARD", 
                "Generated Library I-Card " + saved.getCardNumber() + " for " + targetUsername, null);
                
        return saved;
    }

    @Transactional
    public com.iit.admin.entity.LibraryCard revokeCard(Long cardId, String librarianUsername) {
        com.iit.admin.entity.LibraryCard card = libraryCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Library Card not found"));
        
        if ("REVOKED".equals(card.getStatus())) {
            throw new BadRequestException("Card is already revoked.");
        }
        
        card.setStatus("REVOKED");
        com.iit.admin.entity.LibraryCard saved = libraryCardRepository.save(card);
        
        activityLogService.log(librarianUsername, "REVOKE_CARD", 
                "Revoked Library I-Card " + card.getCardNumber(), null);
                
        return saved;
    }

    @Transactional(readOnly = true)
    public List<com.iit.admin.entity.LibraryCard> searchCards(String query) {
        if (query == null || query.trim().isEmpty()) {
            return libraryCardRepository.findAll();
        }
        return libraryCardRepository.searchCards(query);
    }
}
