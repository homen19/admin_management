package com.iit.admin.repository;

import com.iit.admin.entity.HostelRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HostelRoomRepository extends JpaRepository<HostelRoom, Long> {
    List<HostelRoom> findByHostelId(Long hostelId);
    Optional<HostelRoom> findByHostelIdAndRoomNumber(Long hostelId, String roomNumber);
    List<HostelRoom> findByHostelIdAndOccupiedCountLessThan(Long hostelId, Integer capacity);
}
