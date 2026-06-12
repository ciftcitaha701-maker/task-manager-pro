<template>
  <main>
    <TaskList />
  </main>
</template>

<script setup>
// Hier importieren wir unsere Komponente in die Haupt-App
import TaskList from './components/TaskList.vue';
</script>

<style scoped>
main {
  font-family: Arial, sans-serif;
  padding: 2rem;
}
</style>
