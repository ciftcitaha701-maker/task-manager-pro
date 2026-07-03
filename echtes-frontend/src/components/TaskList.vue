<template>
  <div class="page">
    <header class="hero">
      <div class="logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
      </div>
      <h1>Task-Manager</h1>
      <p class="tagline">Aufgaben erstellen, speichern und im Blick behalten.</p>
    </header>

    <section class="card">
      <div class="form">
        <input v-model="newTitle" class="title-input" placeholder="Neue Aufgabe..." @keyup.enter="saveTask" />
        <input v-model="newDate" class="date-input" type="date" />
        <button type="button" @click="saveTask">+ Speichern</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="tasks.length > 0" class="list-head">
        <h2>Deine Aufgaben</h2>
        <span class="count">{{ tasks.length }}</span>
      </div>

      <ul v-if="tasks.length > 0">
        <li v-for="task in tasks" :key="task.id" class="task-item">
          <span class="bullet" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
          </span>
          <span class="task-title">{{ task.title }}</span>
          <span v-if="task.date" class="task-date">{{ formatDate(task.date) }}</span>
        </li>
      </ul>

      <p v-else-if="loading" class="loading"><span class="spinner" aria-hidden="true"></span>Aufgaben werden geladen …</p>

      <div v-else class="empty">
        <div class="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="4" width="14" height="17" rx="2.5" />
            <path d="M9 4.5V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5v1" />
            <path d="M9 10h6M9 14h6M9 18h3" />
          </svg>
        </div>
        <p class="empty-title">Noch keine Aufgaben vorhanden.</p>
        <p class="empty-sub">Lege oben deine erste Aufgabe an.</p>
      </div>
    </section>

    <footer class="foot">Projekt Webtechnologie &middot; Vue 3 &middot; Spring Boot &middot; PostgreSQL</footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const newTitle = ref('');
const newDate = ref('');
const tasks = ref([]);
const error = ref('');
const loading = ref(true);

const backendUrl = 'https://task-manager-backend-aulj.onrender.com/tasks';

function formatDate(dateString) {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

async function loadTasks() {
  try {
    const response = await fetch(backendUrl);
    if (!response.ok) return;
    const data = await response.json();
    tasks.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = 'Backend nicht erreichbar.';
  } finally {
    loading.value = false;
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
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 52px 20px 32px;
}

/* Kopfbereich */
.hero {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

h1 {
  font-size: 2.3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 0 0 6px;
}

.tagline {
  color: #64748b;
  margin: 0;
  font-size: 1.02rem;
}

/* Karte */
.card {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}

/* Eingabemaske */
.form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

input {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.title-input {
  flex: 1;
  min-width: 160px;
}

.date-input {
  min-width: 150px;
}

input:focus {
  border-color: #10b981;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

button {
  padding: 12px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

button:active {
  transform: translateY(0);
}

/* Listenkopf */
.list-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 26px 0 12px;
}

.list-head h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.count {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 1px 10px;
  border-radius: 999px;
}

/* Aufgabenliste */
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
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s, background 0.15s;
  animation: fadeIn 0.25s ease;
}

.task-item:hover {
  background: #ffffff;
  border-color: #d1fae5;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.bullet {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-title {
  font-weight: 600;
  color: #0f172a;
  flex: 1;
  overflow-wrap: anywhere;
}

.task-date {
  font-size: 0.82rem;
  color: #475569;
  background: #eef2f7;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

/* Ladeanzeige */
.loading {
  color: #64748b;
  text-align: center;
  padding: 30px 0 14px;
  margin: 0;
}

.spinner {
  width: 15px;
  height: 15px;
  border: 2.5px solid #d1fae5;
  border-top-color: #059669;
  border-radius: 50%;
  display: inline-block;
  margin-right: 9px;
  vertical-align: -2px;
  animation: spin 0.8s linear infinite;
}

/* Leerer Zustand */
.empty {
  text-align: center;
  padding: 36px 0 18px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #ecfdf5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.empty-title {
  font-weight: 600;
  color: #334155;
  margin: 0 0 2px;
}

.empty-sub {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0;
}

/* Fehlermeldung */
.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  margin: 14px 0 0;
}

/* Fusszeile */
.foot {
  text-align: center;
  color: #94a3b8;
  font-size: 0.82rem;
  margin-top: 26px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 520px) {
  h1 { font-size: 1.9rem; }
  .form { flex-direction: column; }
  .date-input { min-width: 0; }
  button { width: 100%; }
}
</style>
