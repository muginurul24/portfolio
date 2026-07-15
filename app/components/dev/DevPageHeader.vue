<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  total?: number
}>()
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
    <div class="min-w-0">
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ title }}
      </h1>
      <p
        v-if="subtitle || total != null"
        class="text-sm text-muted mt-1"
      >
        <span v-if="subtitle">{{ subtitle }}</span>
        <span
          v-if="total != null"
          class="tabular-nums"
        > · {{ total }}</span>
      </p>
    </div>
    <div class="flex flex-wrap gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
