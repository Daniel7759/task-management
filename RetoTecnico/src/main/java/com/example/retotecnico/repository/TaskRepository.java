package com.example.retotecnico.repository;

import com.example.retotecnico.models.Task;
import com.example.retotecnico.utils.TaskState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findTasksByUserUsername(String username);
    List<Task> findTaskByState(TaskState state);
}
