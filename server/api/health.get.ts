export default defineEventHandler(() => {
  return {
    ok: true,
    service: 'mugiewdev',
    ts: new Date().toISOString()
  }
})
