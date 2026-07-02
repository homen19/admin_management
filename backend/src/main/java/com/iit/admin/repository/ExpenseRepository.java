package com.iit.admin.repository;

import com.iit.admin.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByDepartmentId(Long departmentId);
    List<Expense> findByExpenseDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE MONTH(e.expenseDate) = :month AND YEAR(e.expenseDate) = :year")
    BigDecimal sumByMonthYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumTotalExpense();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.department.id = :deptId AND YEAR(e.expenseDate) = :year")
    BigDecimal sumByDepartmentAndYearInt(@Param("deptId") Long deptId, @Param("year") int year);
}
