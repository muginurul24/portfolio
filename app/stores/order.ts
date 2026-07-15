import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
  state: () => ({
    domainName: '' as string,
    domainTld: 'com' as string,
    templateSlug: '' as string,
    packageId: 'pkg_export_1y' as string,
    termYears: 1 as 1 | 2 | 3,
    promoCode: '' as string
  }),
  getters: {
    fullDomain: s => (s.domainName ? `${s.domainName}.${s.domainTld}` : '')
  },
  actions: {
    setDomain(name: string, tld: string) {
      this.domainName = name
      this.domainTld = tld
    },
    setTemplate(slug: string) {
      this.templateSlug = slug
    },
    setPackage(id: string) {
      this.packageId = id
    },
    setTermYears(years: 1 | 2 | 3) {
      this.termYears = years
    },
    setPromoCode(code: string) {
      this.promoCode = code
    }
  }
})
