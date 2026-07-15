export function useWhatsApp() {
  const config = useRuntimeConfig()
  const number = computed(() => config.public.whatsappNumber as string)
  function link(text?: string) {
    const base = `https://wa.me/${number.value}`
    return text ? `${base}?text=${encodeURIComponent(text)}` : base
  }
  return { number, link }
}
