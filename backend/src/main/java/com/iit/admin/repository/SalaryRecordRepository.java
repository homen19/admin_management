package com.iit.admin.repository;

import com.iit.admin.entity.SalaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SalaryRecordRepository extends JpaRepository<SalaryRecord, Long> {
    List<SalaryRecord> findByUserId(Long userId);
    List<SalaryRecord> findByMonthAndYear(int month, int year);
    List<SalaryRecord> findByStatus(String status);
    Optional<SalaryRecord> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM SalaryRecord s WHERE s.status = 'PAID' AND s.month = :month AND s.year = :year")
    BigDecimal sumPaidByMonthYear(@Param("month") int month, @Param("year") int year);
}
