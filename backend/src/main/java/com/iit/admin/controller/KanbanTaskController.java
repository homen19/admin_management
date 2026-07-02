package com.iit.admin.controller;

import com.iit.admin.entity.KanbanTask;
import com.iit.admin.repository.KanbanTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/kanban-tasks")
public class KanbanTaskController {

    @Autowired
    private KanbanTaskRepository taskRepository;

    @Autowired
    private com.iit.admin.repository.UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<String>> getStaffAndAdmins() {
        List<com.iit.admin.entity.User> users = userRepository.findByRole_NameNot("ROLE_STUDENT");
        List<String> usernames = users.stream().map(com.iit.admin.entity.User::getUsername).toList();
        return ResponseEntity.ok(usernames);
    }

    @GetMapping
    public List<KanbanTask> getAllTasks() {
        return taskRepository.findAll();
    }

    @PostMapping
    public KanbanTask createTask(@RequestBody KanbanTask task) {
        return taskRepository.save(task);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<KanbanTask> updateTask(@PathVariable String taskId, @RequestBody KanbanTask taskDetails) {
        Optional<KanbanTask> taskOptional = taskRepository.findByTaskId(taskId);
        
        if (taskOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        KanbanTask task = taskOptional.get();
        task.setSummary(taskDetails.getSummary());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setAssignee(taskDetails.getAssignee());
        task.setReporter(taskDetails.getReporter());
        task.setPriority(taskDetails.getPriority());
        task.setType(taskDetails.getType());

        KanbanTask updatedTask = taskRepository.save(task);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable String taskId) {
        Optional<KanbanTask> taskOptional = taskRepository.findByTaskId(taskId);
        if (taskOptional.isPresent()) {
            taskRepository.delete(taskOptional.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
