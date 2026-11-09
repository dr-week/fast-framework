<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { mountZuariCounter } from '../zuari-counter'

const emit = defineEmits<{ 'count-change': [value: number] }>()
const host = ref<HTMLElement | null>(null)
let destroy = () => {}

onMounted(() => {
  if (!host.value) throw new Error('Zuari island host was not mounted.')
  destroy = mountZuariCounter(host.value, value => emit('count-change', value))
})

onBeforeUnmount(() => destroy())
</script>

<template>
  <div ref="host" class="zuari-island-host" />
</template>
