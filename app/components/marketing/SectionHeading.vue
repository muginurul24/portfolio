<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}>(), {
  align: 'center'
})
</script>

<template>
  <div
    class="mb-10 max-w-2xl"
    :class="align === 'center' ? 'mx-auto text-center' : 'text-left'"
  >
    <p
      v-if="eyebrow"
      class="text-sm font-semibold tracking-wide text-primary uppercase mb-2"
    >
      {{ eyebrow }}
    </p>
    <h2 class="text-display text-3xl md:text-4xl text-highlighted">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-3 text-muted text-base md:text-lg leading-relaxed"
    >
      {{ description }}
    </p>
  </div>
</template>
