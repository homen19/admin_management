package com.iit.admin.repository;

import com.iit.admin.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    
    @Query("SELECT h FROM Holiday h WHERE h.holidayDate >= :start AND h.holidayDate <= :end ORDER BY h.holidayDate ASC")
    List<Holiday> findHolidaysInRange(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
