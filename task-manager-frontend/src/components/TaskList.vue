<template>
  <div class="task-list-container">
    <h2>Meine Aufgaben (Milestone 2)</h2>
    <ul>
      <!-- HIER ist das Wichtigste für M2: Die v-for Schleife! -->
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <strong>{{ task.title }}</strong> - <span>Fällig: {{ task.date }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
// Hier sind unsere Test-Aufgaben
const tasks = [
  { id: 1, title: 'Vue.js installieren', date: '2026-05-04' },
  { id: 2, title: 'Milestone 2 abgeben', date: '2026-05-15' },
  { id: 3, title: 'Das Wochenende genießen', date: '2026-05-09' }
];
</script>

<style scoped>
.task-list-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  color: black;
}
.task-item {
  margin: 10px 0;
  padding: 10px;
  background: white;
  border-left: 5px solid #42b983; /* Vue-Grün */
  list-style: none;
  text-align: left;
}
</style>