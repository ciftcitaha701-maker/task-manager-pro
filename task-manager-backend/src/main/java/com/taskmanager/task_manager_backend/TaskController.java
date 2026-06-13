package com.taskmanager.task_manager_backend;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "https://task-manager-pro-i74q.onrender.com") 
public class TaskController {

    // 1. Eine leere, flexible Liste, die neue Aufgaben speichern kann
    private List<Task> tasks = new ArrayList<>();

    // 2. GET-Route: Schickt die aktuelle Liste ans Frontend (startet als "[]")
    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return tasks;
    }

    // 3. POST-Route: Empfängt den Text vom Frontend und speichert ihn in der Liste
    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task newTask) { 
        
        // Wir vergeben automatisch eine fortlaufende ID (1, 2, 3...)
        newTask.setId(tasks.size() + 1);
        
        // Die vom Frontend geschickte Aufgabe wird in unsere Backend-Liste gepackt
        tasks.add(newTask);
        
        return newTask;
    }
}