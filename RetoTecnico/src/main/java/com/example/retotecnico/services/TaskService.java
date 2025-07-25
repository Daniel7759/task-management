package com.example.retotecnico.services;

import com.example.retotecnico.models.Task;
import com.example.retotecnico.repository.TaskRepository;
import com.example.retotecnico.utils.TaskState;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class TaskService {

    @PersistenceContext
    private EntityManager entityManager;

    private final TaskRepository taskRepository;
    private final UserService userService;

    public TaskService(TaskRepository taskRepository, UserService userService) {
        this.taskRepository = taskRepository;
        this.userService = userService;
    }

    @Transactional
    public Task createTask(Task task, String username) {
        validateDueDate(task.getDueDate());
        task.setCreationDate(LocalDate.now());
        task.setState(TaskState.PENDING);
        task.setUser(userService.getUserByUsername(username));
        return taskRepository.save(task);

    }

    @Transactional
    public Task updateTask(Long taskId, Task task) {
        Task taskToUpdate = getTaskById(taskId);
        taskToUpdate.setTitle(task.getTitle());
        taskToUpdate.setDescription(task.getDescription());
        validateDueDate(task.getDueDate());
        taskToUpdate.setDueDate(task.getDueDate());
        return taskRepository.save(taskToUpdate);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    @Transactional(readOnly = true)
    public Task getTaskById(Long taskId){
        return taskRepository.findById(taskId).orElseThrow(
                () -> new RuntimeException("Task not found")
        );
    }

    //Method to get all tasks for all users
    @Transactional(readOnly = true)
    public Page<Task> getAllTasks(String param, int page, int size, String direction) {
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);

        if (param == null || param.isEmpty()) {
            return taskRepository.findAll(PageRequest.of(page, size));
        }

        Sort sort = Sort.by(sortDirection, param);
        Pageable pageable = PageRequest.of(page, size, sort);
        return taskRepository.findAll(pageable);

    }

    //Method to get all tasks by user
    @Transactional(readOnly = true)
    public List<Task> getMyTasks(String username, String state, String title, String dueDate, String sort) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Task> cq = cb.createQuery(Task.class);

        Root<Task> task = cq.from(Task.class);
        List<Predicate> predicates = new ArrayList<>();

        if (state != null) {
            try {
                predicates.add(cb.equal(task.get("state"), TaskState.valueOf(state.toUpperCase())));
            }catch (IllegalArgumentException e){
                throw new RuntimeException("Invalid state parameter, only PENDING or COMPLETED are allowed");
            }
        }
        if (title != null) {
            predicates.add(cb.like(task.get("title"), "%" + title + "%"));
        }
        if (dueDate != null) {
            predicates.add(cb.equal(task.get("dueDate"), LocalDate.parse(dueDate)));
        }

        predicates.add(cb.equal(task.get("user"), userService.getUserByUsername(username)));
        cq.where(predicates.toArray(new Predicate[0]));
        if (sort != null) {
            if (sort.equals("title")) {
                cq.orderBy(cb.asc(task.get("title")));
            } else if (sort.equals("dueDate")) {
                cq.orderBy(cb.asc(task.get("dueDate")));
            } else {
                throw new RuntimeException("Invalid sort parameter: only title or dueDate are allowed");
            }
        } else {
            cq.orderBy(cb.asc(task.get("id")));
        }
        return entityManager.createQuery(cq).getResultList();
    }

    @Transactional
    public Task taskStateCompleted(Long taskId){
        Task taskToUpdate = taskRepository.findById(taskId).orElseThrow(
                () -> new RuntimeException("Task not found")
        );
        taskToUpdate.setState(TaskState.COMPLETED);
        return taskRepository.save(taskToUpdate);
    }

    private void validateDueDate(LocalDate dueDate){
        if(dueDate.isBefore(LocalDate.now())){
            throw new RuntimeException("Due date must be in the future");
        }
    }
}
