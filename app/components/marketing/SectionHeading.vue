<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  index?: string
}>(), {
  align: 'center'
})
</script>

<template>
  <div
    class="mb-10 md:mb-12 max-w-3xl"
    :class="align === 'center' ? 'mx-auto text-center' : 'text-left'"
  >
    <div
      class="flex items-end gap-3 mb-3"
      :class="align === 'center' ? 'justify-center' : 'justify-start'"
    >
      <span
        v-if="index"
        class="section-index text-4xl md:text-5xl select-none"
        aria-hidden="true"
      >{{ index }}</span>
      <p
        v-if="eyebrow"
        class="text-sm font-semibold tracking-wide text-primary uppercase pb-1"
      >
        {{ eyebrow }}
      </p>
    </div>
    <h2 class="text-display text-3xl md:text-4xl lg:text-[2.75rem] text-highlighted">
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
