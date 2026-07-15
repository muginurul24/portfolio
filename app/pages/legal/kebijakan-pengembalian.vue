<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('footer.refund'),
  description: 'Kebijakan pengembalian dana MugiewDev — ringkas dan transparan.'
})
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <h1 class="text-3xl md:text-4xl font-semibold text-highlighted tracking-tight">
      {{ t('footer.refund') }}
    </h1>
    <p class="mt-3 text-muted">
      Terakhir diperbarui: 15 Juli 2026. Ringkasan kebijakan refund.
    </p>

    <div class="mt-10 space-y-8 text-default leading-relaxed">
      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          1. Prinsip
        </h2>
        <p>
          Biaya domain, hosting, dan aktivasi website bersifat
          <strong>non-refundable</strong> setelah domain terdaftar dan/atau
          website diprovisioning, karena biaya pihak ketiga sudah terpakai.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          2. Pesanan belum bayar
        </h2>
        <p>
          Pesanan menunggu pembayaran dibatalkan otomatis dalam
          <strong>2×24 jam</strong>. Tidak ada penagihan; tidak ada refund
          karena belum ada pembayaran.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          3. Gagal aktivasi di pihak kami
        </h2>
        <p>
          Jika setelah pembayaran lunas kami gagal mengaktifkan layanan
          karena kesalahan internal (bukan data salah / domain tidak bisa
          didaftarkan di registrar), hubungi CS. Kami upayakan perbaikan
          atau opsi penggantian setara / refund proporsional sesuai kasus.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          4. Double charge / kesalahan teknis gateway
        </h2>
        <p>
          Tagihan ganda akibat gangguan gateway dapat diajukan dengan bukti
          (screenshot, ID transaksi). Setelah diverifikasi, kelebihan
          dikembalikan lewat metode yang memungkinkan (biasanya ke sumber
          pembayaran).
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          5. Promo & diskon
        </h2>
        <p>
          Nilai promo tidak dapat dicairkan tunai. Pembatalan yang
          memenuhi syarat refund dihitung dari jumlah yang benar-benar
          dibayar, bukan harga coret.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          6. Cara mengajukan
        </h2>
        <p>
          Kirim nomor pesanan, email akun, dan alasan lewat WhatsApp CS
          atau email resmi. Tim meninjau maksimal 5 hari kerja. Keputusan
          final mengacu pada kebijakan ini dan bukti transaksi.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          7. Kontak
        </h2>
        <p>
          Butuh klarifikasi sebelum bayar? Chat CS dulu — lebih aman
          daripada minta refund setelah domain aktif.
        </p>
      </section>
    </div>
  </UContainer>
</template>
