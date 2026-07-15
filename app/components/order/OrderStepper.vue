<script setup lang="ts">
const props = defineProps<{
  /** 1 = domain, 2 = checkout, 3 = success */
  step: 1 | 2 | 3
}>()

const { t } = useI18n()

const steps = computed(() => [
  { n: 1 as const, label: t('order.stepDomain') },
  { n: 2 as const, label: t('order.stepCheckout') },
  { n: 3 as const, label: t('order.stepDone') }
])

function stateOf(n: 1 | 2 | 3): 'done' | 'current' | 'todo' {
  if (n < props.step) return 'done'
  if (n === props.step) return 'current'
  return 'todo'
}
</script>

<template>
  <nav
    class="mb-8"
    :aria-label="t('order.stepOf', { step: step, total: 3 })"
  >
    <ol class="flex items-center gap-0">
      <li
        v-for="(s, i) in steps"
        :key="s.n"
        class="flex items-center min-w-0"
        :class="i < steps.length - 1 ? 'flex-1' : ''"
      >
        <div class="flex flex-col items-center gap-1.5 shrink-0">
          <span
            class="flex size-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums ring-2 transition-colors"
            :class="{
              'bg-primary text-inverted ring-primary shadow-glow-sky': stateOf(s.n) === 'current',
              'bg-primary/15 text-primary ring-primary/40': stateOf(s.n) === 'done',
              'bg-muted text-muted ring-default': stateOf(s.n) === 'todo'
            }"
            :aria-current="stateOf(s.n) === 'current' ? 'step' : undefined"
          >
            <UIcon
              v-if="stateOf(s.n) === 'done'"
              name="i-lucide-check"
              class="size-4"
            />
            <template v-else>
              {{ s.n }}
            </template>
          </span>
          <span
            class="hidden sm:block text-xs font-medium max-w-24 text-center truncate"
            :class="stateOf(s.n) === 'todo' ? 'text-muted' : 'text-highlighted'"
          >
            {{ s.label }}
          </span>
        </div>
        <div
          v-if="i < steps.length - 1"
          class="mx-2 sm:mx-3 h-0.5 flex-1 rounded-full min-w-4"
          :class="s.n < step ? 'bg-primary/50' : 'bg-muted'"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>
