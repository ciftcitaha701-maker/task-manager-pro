package com.taskmanager.task_manager_backend;

public class Task {
    
    // HIER IST DIE MAGIE: Integer statt int
    private Integer id;
    private String title;
    private String date;

    // Leerer Konstruktor (Pflicht für POST-Requests!)
    public Task() {}

    public Task(Integer id, String title, String date) {
        this.id = id;
        this.title = title;
        this.date = date;
    }

    public Integer getId() { return id; }
    public String getTitle() { return title; }
    public String getDate() { return date; }

    public void setId(Integer id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDate(String date) { this.date = date; }
}