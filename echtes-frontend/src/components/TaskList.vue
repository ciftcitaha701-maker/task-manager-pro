<template>
  <div class="task-list-container">
    <h2>Meine Aufgaben</h2>

    <div class="add-task-form">
      <input v-model="newTitle" placeholder="Neue Aufgabe tippen..." />
      <input v-model="newDate" type="date" />
      <button @click="saveTask">Speichern</button>
    </div>

    <ul>
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <strong>{{ task.title }}</strong> - Fällig am: {{ task.date }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 1. Leere "Behälter" für unser Formular
const newTitle = ref('');
const newDate = ref('');

// 2. Unsere Aufgabenliste (startet komplett leer!)
const tasks = ref([]);

// 3. Die URL zu unserem Java-Backend (Port 8081)
const backendUrl = 'https://task-manager-backend-aulj.onrender.com';

// FUNKTION 1: Alle Aufgaben vom Backend LADEN (GET)
async function loadTasks() {
  try {
    const response = await fetch(backendUrl);
    const data = await response.json();
    tasks.value = data; // Die Backend-Daten in unsere Liste packen
  } catch (error) {
    console.error('Fehler beim Laden:', error);
  }
}

// FUNKTION 2: Eine neue Aufgabe ans Backend SENDEN (POST)
async function saveTask() {
  // Wenn kein Titel eingetippt wurde, brechen wir ab
  if (newTitle.value === '') return;

  // Wir schnüren ein Paket mit den eingetippten Daten
  const newTaskData = {
    title: newTitle.value,
    date: newDate.value
  };

  // Wir stellen den "Briefumschlag" für den Versand ein (POST-Methode)
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newTaskData)
  };

  try {
    // Wir schießen das Paket ans Backend
    const response = await fetch(backendUrl, requestOptions);
    const savedTask = await response.json();

    // Wir fügen die Antwort vom Backend sofort zu unserer Liste auf dem Bildschirm hinzu
    tasks.value.push(savedTask);

    // Formular-Felder wieder leer machen für die nächste Aufgabe
    newTitle.value = '';
    newDate.value = '';
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
  }
}

// Wenn die Seite geladen wird, holen wir sofort die aktuellen Aufgaben aus dem Backend
onMounted(() => {
  loadTasks();
});
</script>

<style scoped>
.task-list-container {
  background: #f4f4f4;
  padding: 20px;
  border-radius: 10px;
  color: black;
  max-width: 500px;
  margin: 0 auto;
}
.add-task-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
}
button {
  padding: 8px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background-color: #33a06f;
}
.task-item {
  margin: 10px 0;
  padding: 10px;
  background: white;
  border-left: 5px solid #42b983;
  list-style: none;
  text-align: left;
}
</style>