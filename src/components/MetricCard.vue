<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  value: string
  label: string
}>()

const displayValue = ref(0)
const isAnimating = ref(false)

// Parse the target value (remove commas and convert to number)
const targetValue = computed(() => {
  return parseInt(props.value.replace(/,/g, ''))
})

// Format number with commas
const formattedValue = computed(() => {
  return displayValue.value.toLocaleString('en-US')
})

// Animate counter
const animateCounter = () => {
  if (isAnimating.value) return
  isAnimating.value = true

  const duration = 2000 // 2 seconds
  const startTime = Date.now()
  const startValue = 0
  const endValue = targetValue.value

  const animate = () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    displayValue.value = Math.floor(startValue + (endValue - startValue) * easeOut)

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      displayValue.value = endValue
      isAnimating.value = false
    }
  }

  requestAnimationFrame(animate)
}

onMounted(() => {
  // Start animation after a small delay
  setTimeout(() => {
    animateCounter()
  }, 400)
})
</script>

<template>
  <div class="bg-white rounded-lg p-5 shadow-md border border-slate-200 flex-1 min-w-[200px]">
    <div class="text-3xl font-bold text-blue-600 mb-2 font-mono tabular-nums">{{ formattedValue }}</div>
    <p class="text-slate-700 text-base font-semibold">{{ label }}</p>
  </div>
</template>
