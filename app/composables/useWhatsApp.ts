export function useWhatsApp() {
  const config = useRuntimeConfig()
  /** Always a digit string — never pass non-string into formatters. */
  const number = computed(() => {
    const raw = config.public.whatsappNumber
    return String(raw ?? '6281280080275').replace(/\D/g, '') || '6281280080275'
  })
  function link(text?: string) {
    const base = `https://wa.me/${number.value}`
    return text ? `${base}?text=${encodeURIComponent(text)}` : base
  }
  return { number, link }
}
