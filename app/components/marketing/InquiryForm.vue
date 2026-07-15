<script setup lang="ts">
const props = withDefaults(defineProps<{
  service?: string
  source?: string
  compact?: boolean
}>(), {
  source: 'website',
  compact: false
})

const { t } = useI18n()
const toast = useToast()
const { link } = useWhatsApp()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const waHref = computed(() => {
  const parts = [
    t('inquiry.waPrefill', {
      name: form.name.trim() || '-',
      service: props.service || t('inquiry.serviceGeneric')
    })
  ]
  return link(parts.join(' '))
})

function fieldErrorMessage(e: unknown): string {
  const err = e as {
    data?: { message?: string, statusMessage?: string, data?: unknown }
    statusMessage?: string
    statusCode?: number
  }
  if (err?.statusCode === 429) {
    return err.statusMessage || t('inquiry.errorRateLimit')
  }
  if (err?.statusCode === 400) {
    return err.data?.message || err.statusMessage || t('inquiry.errorValidation')
  }
  return err?.data?.message || err?.statusMessage || t('inquiry.errorGeneric')
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/inquiries', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        source: props.source || 'website',
        service: props.service || undefined
      }
    })
    submitted.value = true
    toast.add({
      title: t('inquiry.successTitle'),
      description: t('inquiry.successDesc'),
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
    form.name = ''
    form.email = ''
    form.phone = ''
    form.message = ''
  } catch (e: unknown) {
    error.value = fieldErrorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="glass-panel shadow-soft-lg rounded-2xl ring-1 ring-default"
    :class="compact ? 'p-5 md:p-6' : 'p-6 md:p-8'"
  >
    <div class="mb-5 space-y-1.5">
      <h3 class="text-lg font-semibold text-highlighted">
        {{ t('inquiry.title') }}
      </h3>
      <p class="text-sm text-muted leading-relaxed">
        {{ t('inquiry.subtitle') }}
      </p>
    </div>

    <div
      v-if="submitted"
      class="space-y-4"
    >
      <UAlert
        color="success"
        variant="subtle"
        :title="t('inquiry.successTitle')"
        :description="t('inquiry.successDesc')"
        icon="i-lucide-check-circle"
      />
      <div class="flex flex-wrap gap-3">
        <UButton
          :to="waHref"
          target="_blank"
          color="primary"
          size="lg"
          icon="i-simple-icons-whatsapp"
          class="shadow-glow-sky"
        >
          {{ t('inquiry.chatWa') }}
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          @click="submitted = false"
        >
          {{ t('inquiry.sendAnother') }}
        </UButton>
      </div>
    </div>

    <UForm
      v-else
      :state="form"
      class="space-y-4"
      @submit="onSubmit"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField
          :label="t('inquiry.name')"
          name="name"
          required
        >
          <UInput
            v-model="form.name"
            type="text"
            autocomplete="name"
            size="lg"
            class="w-full"
            :placeholder="t('inquiry.namePlaceholder')"
            required
            minlength="2"
            maxlength="120"
          />
        </UFormField>

        <UFormField
          :label="t('inquiry.email')"
          name="email"
          required
        >
          <UInput
            v-model="form.email"
            type="email"
            autocomplete="email"
            size="lg"
            class="w-full"
            :placeholder="t('inquiry.emailPlaceholder')"
            required
          />
        </UFormField>
      </div>

      <UFormField
        :label="t('inquiry.phone')"
        name="phone"
        :hint="t('inquiry.phoneHint')"
      >
        <UInput
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          size="lg"
          class="w-full"
          :placeholder="t('inquiry.phonePlaceholder')"
          minlength="8"
          maxlength="20"
        />
      </UFormField>

      <UFormField
        :label="t('inquiry.message')"
        name="message"
        required
      >
        <UTextarea
          v-model="form.message"
          size="lg"
          class="w-full"
          :placeholder="t('inquiry.messagePlaceholder')"
          :rows="compact ? 3 : 4"
          required
          minlength="10"
          maxlength="2000"
        />
      </UFormField>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        :title="error"
        icon="i-lucide-circle-alert"
      />

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
        <UButton
          type="submit"
          color="primary"
          size="xl"
          :loading="loading"
          :disabled="loading"
          trailing-icon="i-lucide-send"
          class="shadow-glow-sky min-h-11"
        >
          {{ t('inquiry.submit') }}
        </UButton>
        <p class="text-xs text-muted leading-relaxed sm:flex-1">
          {{ t('inquiry.privacyNote') }}
        </p>
      </div>
    </UForm>
  </div>
</template>
