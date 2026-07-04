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
        <button type="button" class="save-btn" @click="saveTask">+ Speichern</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="tasks.length > 0">
        <div class="list-head">
          <h2>Deine Aufgaben</h2>
          <span class="count">{{ visibleTasks.length }}</span>
          <div class="tabs" role="tablist">
            <button type="button" class="tab-btn" :class="{ active: filter === 'alle' }" @click="filter = 'alle'">Alle</button>
            <button type="button" class="tab-btn" :class="{ active: filter === 'offen' }" @click="filter = 'offen'">Offen</button>
            <button type="button" class="tab-btn" :class="{ active: filter === 'erledigt' }" @click="filter = 'erledigt'">Erledigt</button>
          </div>
        </div>

        <ul v-if="visibleTasks.length > 0">
          <li
            v-for="task in visibleTasks"
            :key="task.id"
            class="task-item"
            :class="{ selected: selectedId === task.id, pinned: task.pinned, done: task.done }"
            @click="toggleSelect(task.id)"
          >
            <!-- Bearbeitungsmodus -->
            <div v-if="editingId === task.id" class="edit-form" @click.stop>
              <input v-model="editTitle" class="edit-title" @keyup.enter="saveEdit(task)" />
              <input v-model="editDate" type="date" class="edit-date" />
              <div class="edit-actions">
                <button type="button" class="action-btn" @click.stop="saveEdit(task)">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
                  Übernehmen
                </button>
                <button type="button" class="action-btn" @click.stop="cancelEdit">Abbrechen</button>
              </div>
            </div>

            <template v-else>
              <div class="task-row">
                <button
                  type="button"
                  class="bullet"
                  :class="{ checked: task.done }"
                  :title="task.done ? 'Als offen markieren' : 'Als erledigt markieren'"
                  @click.stop="toggleDone(task)"
                >
                  <svg v-if="task.done" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
                </button>
                <span class="task-title" :class="{ done: task.done }">{{ task.title }}</span>
                <span v-if="task.pinned" class="pin-badge" title="Angeheftet" aria-label="Angeheftet">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z" /></svg>
                </span>
                <span v-if="task.date" class="task-date" :class="{ overdue: isOverdue(task) }" :title="isOverdue(task) ? 'Überfällig' : ''">{{ formatDate(task.date) }}</span>
              </div>

              <div v-if="selectedId === task.id" class="task-actions">
                <button type="button" class="action-btn" @click.stop="togglePin(task)">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z" /></svg>
                  {{ task.pinned ? 'Loslösen' : 'Anheften' }}
                </button>
                <button type="button" class="action-btn" @click.stop="startEdit(task)">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></svg>
                  Bearbeiten
                </button>
                <template v-if="confirmDeleteId === task.id">
                  <span class="confirm-text">Wirklich löschen?</span>
                  <button type="button" class="action-btn danger-solid" @click.stop="removeTask(task)">Ja, löschen</button>
                  <button type="button" class="action-btn" @click.stop="confirmDeleteId = null">Abbrechen</button>
                </template>
                <button v-else type="button" class="action-btn danger" @click.stop="confirmDeleteId = task.id">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6M14 11v6" /></svg>
                  Entfernen
                </button>
              </div>
            </template>
          </li>
        </ul>

        <p v-else class="filter-empty">Keine Aufgaben in dieser Ansicht.</p>
      </div>

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
import { ref, computed, onMounted } from 'vue';

const newTitle = ref('');
const newDate = ref('');
const tasks = ref([]);
const error = ref('');
const loading = ref(true);
const selectedId = ref(null);
const confirmDeleteId = ref(null);
const editingId = ref(null);
const editTitle = ref('');
const editDate = ref('');
const filter = ref('alle');

const backendUrl = 'https://task-manager-backend-aulj.onrender.com/tasks';

const visibleTasks = computed(() => {
  if (filter.value === 'offen') return tasks.value.filter(t => t.done !== true);
  if (filter.value === 'erledigt') return tasks.value.filter(t => t.done === true);
  return tasks.value;
});

function formatDate(dateString) {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Datum liegt in der Vergangenheit und die Aufgabe ist noch offen
function isOverdue(task) {
  return !!task.date && task.done !== true && task.date < todayIso();
}

// Angeheftete zuerst, erledigte nach unten, sonst nach ID
function sortTasks(list) {
  return [...list].sort(
    (a, b) =>
      (b.pinned === true) - (a.pinned === true) ||
      (a.done === true) - (b.done === true) ||
      a.id - b.id
  );
}

function toggleSelect(id) {
  if (editingId.value !== null) return;
  confirmDeleteId.value = null;
  selectedId.value = selectedId.value === id ? null : id;
}

function startEdit(task) {
  editingId.value = task.id;
  editTitle.value = task.title;
  editDate.value = task.date || '';
  confirmDeleteId.value = null;
}

function cancelEdit() {
  editingId.value = null;
}

function applyUpdate(updated) {
  tasks.value = sortTasks(tasks.value.map(t => (t.id === updated.id ? updated : t)));
}

async function loadTasks() {
  try {
    const response = await fetch(backendUrl);
    if (!response.ok) return;
    const data = await response.json();
    tasks.value = sortTasks(Array.isArray(data) ? data : []);
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
    tasks.value = sortTasks([...tasks.value, savedTask]);
    newTitle.value = '';
    newDate.value = '';
    error.value = '';
  } catch (e) {
    error.value = 'Fehler beim Speichern.';
  }
}

async function removeTask(task) {
  try {
    const response = await fetch(`${backendUrl}/${task.id}`, { method: 'DELETE' });
    if (!response.ok) { error.value = 'Fehler beim Entfernen.'; return; }
    tasks.value = tasks.value.filter(t => t.id !== task.id);
    if (selectedId.value === task.id) selectedId.value = null;
    confirmDeleteId.value = null;
    error.value = '';
  } catch (e) {
    error.value = 'Fehler beim Entfernen.';
  }
}

async function togglePin(task) {
  try {
    const response = await fetch(`${backendUrl}/${task.id}/pin`, { method: 'PUT' });
    if (!response.ok) { error.value = 'Fehler beim Anheften.'; return; }
    applyUpdate(await response.json());
    error.value = '';
  } catch (e) {
    error.value = 'Fehler beim Anheften.';
  }
}

async function toggleDone(task) {
  try {
    const response = await fetch(`${backendUrl}/${task.id}/done`, { method: 'PUT' });
    if (!response.ok) { error.value = 'Fehler beim Abhaken.'; return; }
    applyUpdate(await response.json());
    error.value = '';
  } catch (e) {
    error.value = 'Fehler beim Abhaken.';
  }
}

async function saveEdit(task) {
  if (editTitle.value.trim() === '') return;

  try {
    const response = await fetch(`${backendUrl}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.value.trim(), date: editDate.value })
    });
    if (!response.ok) { error.value = 'Fehler beim Bearbeiten.'; return; }
    applyUpdate(await response.json());
    editingId.value = null;
    error.value = '';
  } catch (e) {
    error.value = 'Fehler beim Bearbeiten.';
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
  color: var(--text);
  margin: 0 0 6px;
}

.tagline {
  color: var(--text-muted);
  margin: 0;
  font-size: 1.02rem;
}

/* Karte */
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 40px var(--shadow-color);
}

/* Eingabemaske */
.form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

input {
  padding: 12px 14px;
  border: 1.5px solid var(--input-border);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text);
  background: var(--input-bg);
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
  background: var(--input-focus-bg);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.save-btn {
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

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

.save-btn:active {
  transform: translateY(0);
}

/* Listenkopf mit Filter-Tabs */
.list-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 26px 0 12px;
  flex-wrap: wrap;
}

.list-head h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.count {
  background: var(--soft-green-bg);
  color: var(--accent-text);
  border: 1px solid var(--soft-green-border);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 1px 10px;
  border-radius: 999px;
}

.tabs {
  margin-left: auto;
  display: flex;
  gap: 4px;
  background: var(--item-bg);
  border: 1px solid var(--card-border);
  padding: 4px;
  border-radius: 10px;
}

.tab-btn {
  padding: 5px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tab-btn.active {
  background: var(--soft-green-bg);
  color: var(--accent-text);
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
  flex-direction: column;
  padding: 14px 16px;
  background: var(--item-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s, background 0.15s;
  animation: fadeIn 0.25s ease;
}

.task-item:hover {
  background: var(--item-hover-bg);
  border-color: var(--soft-green-border);
  box-shadow: 0 4px 14px var(--shadow-soft);
  transform: translateY(-1px);
}

.task-item.selected {
  background: var(--item-hover-bg);
  border-color: var(--soft-green-strong);
  box-shadow: 0 4px 14px var(--shadow-soft);
}

.task-item.pinned {
  background: var(--pinned-bg);
  border-color: var(--soft-green-strong);
}

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Abhaken-Kreis */
.bullet {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: transparent;
  color: transparent;
  border: 2px solid var(--bullet-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.bullet:hover {
  border-color: var(--accent);
}

.bullet.checked {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: transparent;
  color: #ffffff;
}

.task-title {
  font-weight: 600;
  color: var(--text);
  flex: 1;
  overflow-wrap: anywhere;
}

.task-title.done {
  text-decoration: line-through;
  color: var(--text-muted);
  font-weight: 500;
}

.pin-badge {
  color: var(--accent-text);
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.task-date {
  font-size: 0.82rem;
  color: var(--chip-text);
  background: var(--chip-bg);
  border: 1px solid transparent;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

/* Ueberfaellige Aufgaben */
.task-date.overdue {
  background: var(--danger-bg);
  color: var(--danger);
  border-color: var(--danger-border);
  font-weight: 600;
}

/* Aktionen beim Klick auf eine Aufgabe */
.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--input-border);
  animation: fadeIn 0.2s ease;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: var(--card-bg);
  color: var(--chip-text);
  border: 1px solid var(--input-border);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.action-btn:hover {
  border-color: var(--soft-green-strong);
  background: var(--soft-green-bg);
  color: var(--accent-text);
}

.action-btn.danger:hover {
  border-color: var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger);
}

.action-btn.danger-solid {
  background: #dc2626;
  border-color: transparent;
  color: #ffffff;
}

.action-btn.danger-solid:hover {
  background: #b91c1c;
  border-color: transparent;
  color: #ffffff;
}

.confirm-text {
  font-size: 0.85rem;
  color: var(--danger);
  font-weight: 600;
}

/* Bearbeitungsmodus */
.edit-form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  cursor: default;
}

.edit-form input {
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 14px;
}

.edit-title {
  flex: 1;
  min-width: 140px;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.filter-empty {
  color: var(--text-soft);
  text-align: center;
  padding: 24px 0 10px;
  margin: 0;
  font-size: 0.92rem;
}

/* Ladeanzeige */
.loading {
  color: var(--text-muted);
  text-align: center;
  padding: 30px 0 14px;
  margin: 0;
}

.spinner {
  width: 15px;
  height: 15px;
  border: 2.5px solid var(--soft-green-border);
  border-top-color: var(--accent-text);
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
  background: var(--soft-green-bg);
  color: var(--accent-text);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.empty-title {
  font-weight: 600;
  color: var(--text);
  margin: 0 0 2px;
}

.empty-sub {
  color: var(--text-soft);
  font-size: 0.9rem;
  margin: 0;
}

/* Fehlermeldung */
.error {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid var(--danger-border);
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  margin: 14px 0 0;
}

/* Fusszeile */
.foot {
  text-align: center;
  color: var(--text-soft);
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
  .save-btn { width: 100%; }
  .tabs { margin-left: 0; }
}
</style>
