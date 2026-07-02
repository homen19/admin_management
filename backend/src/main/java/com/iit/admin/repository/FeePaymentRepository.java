package com.iit.admin.repository;

import com.iit.admin.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByStudentId(Long studentId);
    List<FeePayment> findByStatus(String status);
    List<FeePayment> findByAcademicYear(String academicYear);
    Optional<FeePayment> findByReceiptNumber(String receiptNumber);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FeePayment f WHERE f.status = 'PAID'")
    BigDecimal sumTotalCollected();

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FeePayment f WHERE f.status = 'UNPAID' OR f.status = 'PARTIAL'")
    BigDecimal sumTotalPending();

    @Query("SELECT COUNT(f) FROM FeePayment f WHERE f.status = :status")
    long countByStatus(@Param("status") String status);
}
