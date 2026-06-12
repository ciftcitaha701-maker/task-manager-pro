<template>
  <div id="app">
    <h1>Task Manager Pro</h1>
    <TaskList />
  </div>
</template>

<script setup>
// Hier sagen wir der Datei, wo sie die Liste findet
import TaskList from './components/TaskList.vue'
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 40px;
}
</style>