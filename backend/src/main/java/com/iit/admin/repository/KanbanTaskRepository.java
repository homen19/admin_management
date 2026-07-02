package com.iit.admin.repository;

import com.iit.admin.entity.KanbanTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KanbanTaskRepository extends JpaRepository<KanbanTask, Long> {
    Optional<KanbanTask> findByTaskId(String taskId);
}
