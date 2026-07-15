<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number
  cols?: number
}>(), {
  rows: 5,
  cols: 4
})
</script>

<template>
  <div
    class="overflow-hidden rounded-xl ring-1 ring-default bg-default shadow-soft-sm"
    role="status"
    aria-live="polite"
  >
    <div class="divide-y divide-default">
      <div
        v-for="r in rows"
        :key="r"
        class="flex gap-4 px-4 py-3.5"
      >
        <div
          v-for="c in cols"
          :key="c"
          class="h-3.5 flex-1 rounded bg-muted/70 animate-pulse motion-reduce:animate-none"
          :class="c === 1 ? 'max-w-[8rem]' : c === cols ? 'max-w-[4rem]' : ''"
        />
      </div>
    </div>
    <span class="sr-only">Loading</span>
  </div>
</template>
