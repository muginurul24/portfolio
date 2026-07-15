<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
}>(), {
  description: '',
  icon: 'i-lucide-inbox'
})
</script>

<template>
  <div class="rounded-xl ring-1 ring-default bg-default shadow-soft-sm px-6 py-12 text-center">
    <div class="inline-flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted mb-4">
      <UIcon
        :name="icon"
        class="size-6"
      />
    </div>
    <h2 class="text-lg font-semibold text-highlighted tracking-tight">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-2 text-sm text-muted max-w-md mx-auto leading-relaxed"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="mt-5 flex flex-wrap justify-center gap-2"
    >
      <slot />
    </div>
  </div>
</template>
