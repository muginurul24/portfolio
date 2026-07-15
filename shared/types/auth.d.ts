declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    phone?: string | null
    role: 'customer' | 'cs' | 'admin' | 'dev'
  }
}

export {}
