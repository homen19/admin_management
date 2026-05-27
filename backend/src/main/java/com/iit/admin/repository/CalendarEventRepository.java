package com.iit.admin.repository;

import com.iit.admin.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    
    @Query("SELECT e FROM CalendarEvent e WHERE (e.isPublic = true OR e.createdBy.username = :username) " +
           "AND e.startDate >= :start AND e.endDate <= :end ORDER BY e.startDate ASC")
    List<CalendarEvent> findVisibleEventsInRange(
            @Param("username") String username, 
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end);
}
