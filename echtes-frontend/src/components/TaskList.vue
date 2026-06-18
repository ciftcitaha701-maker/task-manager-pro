<template>
  <div class="wrapper">
    <h1>Meine Aufgaben</h1>

    <div class="form">
      <input v-model="newTitle" placeholder="Neue Aufgabe..." @keyup.enter="saveTask" />
      <input v-model="newDate" type="date" />
      <button @click="saveTask">+ Speichern</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <ul v-if="tasks.length > 0">
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <span class="task-title">{{ task.title }}</span>
        <span v-if="task.date" class="task-date">{{ task.date }}</span>
      </li>
    </ul>

    <p v-else class="empty">Noch keine Aufgaben vorhanden.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const newTitle = ref('');
const newDate = ref('');
const tasks = ref([]);
const error = ref('');

const backendUrl = 'https://task-manager-backend-aulj.onrender.com/tasks';

async function loadTasks() {
  try {
    const response = await fetch(backendUrl);
    if (!response.ok) return;
    const data = await response.json();
    tasks.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = 'Backend nicht erreichbar.';
  }
}

async function saveTask() {
  if (newTitle.value.trim() === '') return;

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.value.trim(), date: newDate.value })
    });
    if (!response.ok) { error.value = 'Fehler beim Speichern.'; return; }
    const savedTask = await response.json();
    if (!savedTask.title) { error.value = 'Fehler beim Speichern.'; return; }
    tasks.value.push(savedTask);
    newTitle.value = '';
    newDate.value = '';
    error.value = '';
  } catch (e) {
    error.value = 'Fehler beim Speichern.';
  }
}

onMounted(loadTasks);
</script>

<style scoped>
.wrapper {
  max-width: 560px;
  margin: 60px auto;
  font-family: system-ui, sans-serif;
  padding: 0 16px;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 28px;
  color: #1a1a2e;
}

.form {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

input {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  flex: 1;
  min-width: 140px;
}

input:focus {
  border-color: #42b983;
}

button {
  padding: 10px 18px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

button:hover {
  background: #33a06f;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #42b983;
}

.task-title {
  font-weight: 500;
  color: #1a1a2e;
}

.task-date {
  font-size: 13px;
  color: #888;
}

.empty {
  color: #aaa;
  text-align: center;
  margin-top: 40px;
}

.error {
  color: #e53e3e;
  margin-bottom: 12px;
  font-size: 14px;
}
</style>
