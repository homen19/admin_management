package com.iit.admin.repository;

import com.iit.admin.entity.DepartmentBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DepartmentBudgetRepository extends JpaRepository<DepartmentBudget, Long> {
    List<DepartmentBudget> findByAcademicYear(String academicYear);
    Optional<DepartmentBudget> findByDepartmentIdAndAcademicYear(Long departmentId, String academicYear);
}
