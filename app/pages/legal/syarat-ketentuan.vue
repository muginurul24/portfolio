<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('footer.terms'),
  description: 'Syarat dan ketentuan penggunaan layanan MugiewDev.'
})
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <h1 class="text-3xl md:text-4xl font-semibold text-highlighted tracking-tight">
      {{ t('footer.terms') }}
    </h1>
    <p class="mt-3 text-muted">
      Terakhir diperbarui: 15 Juli 2026. Berlaku untuk seluruh layanan MugiewDev.
    </p>

    <div class="mt-10 space-y-8 text-default leading-relaxed">
      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          1. Layanan
        </h2>
        <p>
          MugiewDev menyediakan platform website untuk UMKM dan eksportir:
          template, domain, hosting, SSL, email bisnis (sesuai paket), akademi,
          dan komunitas. Fitur dapat berubah seiring pengembangan produk.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          2. Akun & data
        </h2>
        <p>
          Anda wajib memberikan data yang benar saat daftar dan checkout.
          Anda bertanggung jawab menjaga kerahasiaan kata sandi. Aktivitas
          dari akun Anda dianggap dilakukan oleh Anda.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          3. Pembayaran
        </h2>
        <p>
          Harga ditampilkan dalam Rupiah (IDR). Total final dihitung ulang di
          server saat checkout (paket, domain, durasi, promo). Pembayaran
          diproses lewat gateway mitra (Xendit). Pesanan yang belum dibayar
          dibatalkan otomatis dalam <strong>2×24 jam</strong>.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          4. Aktivasi website
        </h2>
        <p>
          Setelah pembayaran terverifikasi, website diproses maksimal
          <strong>2×24 jam kerja</strong> (kecuali kendala registrar domain
          atau data tidak lengkap). Aktivasi tidak mengandalkan callback
          klien saja — status lunas dari webhook pembayaran yang sah.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          5. Konten & kepatuhan
        </h2>
        <p>
          Anda dilarang memakai layanan untuk konten ilegal, penipuan,
          pelanggaran hak pihak ketiga, atau spam. Kami dapat menangguhkan
          layanan bila ada pelanggaran atau permintaan otoritas berwenang.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          6. Domain & perpanjangan
        </h2>
        <p>
          Domain terdaftar atas nama pelanggan sesuai data checkout. Biaya
          perpanjangan mengikuti harga berlaku saat perpanjang. Gagal
          perpanjang dapat menyebabkan domain kedaluwarsa atau website
          nonaktif.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          7. Batasan tanggung jawab
        </h2>
        <p>
          Layanan disediakan “sebagaimana adanya”. Kami berupaya menjaga
          uptime wajar, namun tidak menjamin bebas gangguan. Tanggung jawab
          kami terbatas pada nilai biaya layanan yang Anda bayar untuk
          periode terkait, sejauh diizinkan hukum.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          8. Perubahan
        </h2>
        <p>
          Syarat ini dapat diperbarui. Versi terbaru dipublikasikan di halaman
          ini. Penggunaan berkelanjutan setelah pembaruan berarti Anda
          menyetujui versi baru.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          9. Kontak
        </h2>
        <p>
          Pertanyaan seputar syarat ini: hubungi CS lewat WhatsApp atau email
          yang tertera di situs.
        </p>
      </section>
    </div>
  </UContainer>
</template>
