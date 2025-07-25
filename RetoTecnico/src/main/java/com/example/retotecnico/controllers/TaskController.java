package com.example.retotecnico.controllers;

import com.example.retotecnico.models.Task;
import com.example.retotecnico.security.JwtUtils;
import com.example.retotecnico.services.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<?> getAllTasks(
            @RequestParam(required = false, name = "sort") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "ASC") String direction){

        try {
            return ResponseEntity.ok(taskService.getAllTasks(sort, page, size, direction));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<?> getTaskById(@PathVariable Long taskId){
        try {
            return ResponseEntity.ok(taskService.getTaskById(taskId));
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<?> getMyTasks(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false, name = "state") String state,
            @RequestParam(required = false, name = "title") String title,
            @RequestParam(required = false, name = "dueDate") String dueDate,
            @RequestParam(required = false, name = "sort") String sort){
        try {
            String username = JwtUtils.getUsernameFromToken(token.replace("Bearer ", ""));
            return ResponseEntity.ok(taskService.getMyTasks(username,state,title,dueDate,sort));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody Task task, @RequestHeader("Authorization") String token){
        try {
            String username = JwtUtils.getUsernameFromToken(token.replace("Bearer ", ""));
            Task createdTask = taskService.createTask(task,username);
            return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<?> updateTask(@Valid @PathVariable Long taskId, @RequestBody Task task){
        try {
            Task updatedTask = taskService.updateTask(taskId, task);
            return ResponseEntity.ok(updatedTask);
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable(name = "taskId") Long taskId){
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok("Task deleted");
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<?> updateTaskState(@PathVariable Long taskId){
        try {
            Task updatedTaskState = taskService.taskStateCompleted(taskId);
            return ResponseEntity.ok(updatedTaskState);
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
