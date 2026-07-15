<script setup lang="ts">
import type { UserRole } from '~/utils/roles'
import { homeForRole, safeInternalPath } from '~/utils/auth-redirect'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { loggedIn, user, fetch: refreshSession } = useUserSession()

definePageMeta({
  layout: false
})

useSeoMeta({ title: () => t('auth.login') })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function destinationForSession(): string {
  const role = (user.value as { role?: UserRole } | null)?.role
  const fallback = homeForRole(role, localePath)
  return safeInternalPath(route.query.redirect, fallback)
}

if (import.meta.client && loggedIn.value) {
  await navigateTo(destinationForSession())
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await refreshSession()
    await navigateTo(destinationForSession())
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
        <NuxtLink :to="localePath('/')" class="inline-flex items-center cursor-pointer" :aria-label="t('brand.name')">
          <AppLogo class="h-7 w-auto" />
        </NuxtLink>
        <h1 class="mt-4 text-xl font-semibold text-highlighted">
          {{ t('auth.login') }}
        </h1>
      </div>

      <UForm :state="{ email, password }" class="space-y-4" @submit="onSubmit">
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

        <UFormField :label="t('auth.password')" name="password" required>
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
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
          {{ t('auth.login') }}
        </UButton>
      </UForm>

      <p class="mt-6 text-center text-sm text-muted">
        {{ t('auth.noAccount') }}
        <NuxtLink :to="localePath('/register')" class="text-primary font-medium hover:underline cursor-pointer">
          {{ t('auth.register') }}
        </NuxtLink>
      </p>
      <p class="mt-2 text-center text-sm">
        <NuxtLink :to="localePath('/')" class="text-muted hover:underline cursor-pointer">
          {{ t('common.back') }}
        </NuxtLink>
      </p>
    </UCard>
  </div>
</template>
