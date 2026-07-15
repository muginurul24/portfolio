<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { loggedIn, fetch: refreshSession } = useUserSession()

definePageMeta({
  layout: false
})

useSeoMeta({ title: () => t('auth.register') })

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

if (import.meta.client && loggedIn.value) {
  await navigateTo(localePath('/panel'))
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        phone: phone.value || undefined,
        password: password.value
      }
    })
    await refreshSession()
    await navigateTo(localePath('/panel'))
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    error.value = err?.data?.message || err?.statusMessage || t('common.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-muted/40 p-4">
    <UCard class="w-full max-w-md shadow-soft-lg">
      <div class="text-center mb-6">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-2 cursor-pointer">
          <AppLogo class="h-7 w-auto" />
          <span class="font-semibold text-lg">MugiewDev</span>
        </NuxtLink>
        <h1 class="mt-4 text-xl font-semibold text-highlighted">
          {{ t('auth.register') }}
        </h1>
      </div>

      <UForm :state="{ name, email, phone, password }" class="space-y-4" @submit="onSubmit">
        <UFormField :label="t('auth.name')" name="name" required>
          <UInput
            v-model="name"
            type="text"
            autocomplete="name"
            size="lg"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField :label="t('auth.email')" name="email" required>
          <UInput
            v-model="email"
            type="email"
            autocomplete="email"
            size="lg"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField :label="t('auth.phone')" name="phone">
          <UInput
            v-model="phone"
            type="tel"
            autocomplete="tel"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('auth.password')" name="password" required>
          <UInput
            v-model="password"
            type="password"
            autocomplete="new-password"
            size="lg"
            class="w-full"
            required
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :title="error"
          icon="i-lucide-circle-alert"
        />

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="loading"
          :disabled="loading"
        >
          {{ t('auth.register') }}
        </UButton>
      </UForm>

      <p class="mt-6 text-center text-sm text-muted">
        {{ t('auth.haveAccount') }}
        <NuxtLink :to="localePath('/login')" class="text-primary hover:underline cursor-pointer">
          {{ t('auth.login') }}
        </NuxtLink>
      </p>

      <p class="mt-3 text-center text-sm text-muted">
        <NuxtLink :to="localePath('/')" class="text-primary hover:underline cursor-pointer">
          {{ t('common.back') }}
        </NuxtLink>
      </p>
    </UCard>
  </div>
</template>
