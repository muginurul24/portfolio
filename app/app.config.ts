export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'slate',
      success: 'green',
      warning: 'amber',
      error: 'red',
      info: 'sky'
    },
    button: {
      defaultVariants: {
        size: 'md'
      },
      slots: {
        base: 'cursor-pointer font-semibold'
      }
    },
    card: {
      slots: {
        root: 'shadow-soft-md ring-1 ring-default/80 bg-default'
      }
    }
  },
  // App-level public tokens (HMR-friendly, non-secret)
  mugiew: {
    brand: 'MugiewDev',
    tagline: 'Bikin Website · Tanpa Ribet',
    supportWa: '6281280080275',
    promoCode: 'WEBSITEJUARA',
    promoDiscountIdr: 500_000,
    startingPriceYearlyIdr: 1_000_000
  }
})
