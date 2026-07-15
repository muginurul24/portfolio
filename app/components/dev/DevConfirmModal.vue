<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  color?: 'error' | 'warning' | 'primary'
}>(), {
  description: '',
  confirmLabel: '',
  cancelLabel: '',
  loading: false,
  color: 'error'
})

const emit = defineEmits<{
  confirm: []
}>()

const { t } = useI18n()
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard :ui="{ root: 'shadow-soft-lg' }">
        <template #header>
          <h2 class="font-semibold text-highlighted">
            {{ title }}
          </h2>
        </template>

        <p
          v-if="description"
          class="text-sm text-muted leading-relaxed"
        >
          {{ description }}
        </p>

        <div class="flex justify-end gap-2 mt-6">
          <UButton
            color="neutral"
            variant="ghost"
            class="min-h-10"
            :disabled="loading"
            @click="open = false"
          >
            {{ cancelLabel || t('common.cancel') }}
          </UButton>
          <UButton
            :color="color"
            class="min-h-10"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmLabel || t('common.save') }}
          </UButton>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
