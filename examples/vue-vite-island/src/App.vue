<script setup lang="ts">
import { ref } from 'vue'
import ZuariIsland from './components/ZuariIsland.vue'

const isMounted = ref(true)
const latestCount = ref(0)
</script>

<template>
  <main class="demo-shell">
    <h1>Vue host with a Zuari island</h1>
    <p>Vue owns this page. Zuari owns only the mounted island below.</p>
    <button
      type="button"
      aria-controls="zuari-island-host"
      :aria-expanded="isMounted"
      @click="isMounted = !isMounted"
    >
      {{ isMounted ? 'Unmount' : 'Mount' }} Zuari island
    </button>
    <p class="host-status" aria-live="polite">Vue received count: {{ latestCount }}</p>
    <ZuariIsland
      v-if="isMounted"
      id="zuari-island-host"
      @count-change="latestCount = $event"
    />
  </main>
</template>
