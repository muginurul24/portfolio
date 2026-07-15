<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('footer.privacy'),
  description: 'Kebijakan privasi MugiewDev — cara kami mengumpulkan dan melindungi data Anda.'
})
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <h1 class="text-display text-3xl md:text-4xl text-highlighted">
      {{ t('footer.privacy') }}
    </h1>
    <p class="mt-3 text-muted font-serif">
      Terakhir diperbarui: 15 Juli 2026.
    </p>

    <div class="mt-10 space-y-8 text-default leading-relaxed font-serif">
      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          1. Data yang kami kumpulkan
        </h2>
        <ul class="list-disc pl-5 space-y-2">
          <li>Identitas: nama, email, nomor WhatsApp.</li>
          <li>Data pesanan: domain, paket, template, riwayat pembayaran (status, ID invoice mitra).</li>
          <li>Teknis: log akses, cookie sesi, preferensi bahasa/tema.</li>
          <li>Konten yang Anda unggah ke website (dikelola di panel).</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          2. Tujuan pemrosesan
        </h2>
        <p>
          Data dipakai untuk menyediakan layanan, memproses pembayaran,
          aktivasi website, dukungan pelanggan, keamanan, dan peningkatan
          produk. Kami tidak menjual data pribadi Anda.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          3. Berbagi data
        </h2>
        <p>
          Data dapat dibagikan ke mitra yang membantu operasional: gateway
          pembayaran, registrar domain, penyedia email, hosting — sebatas
          diperlukan. Mereka wajib menjaga kerahasiaan sesuai kontrak.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          4. Cookie & sesi
        </h2>
        <p>
          Kami memakai cookie/sesi untuk autentikasi, preferensi, dan
          keamanan. Anda dapat menonaktifkan cookie di browser; beberapa
          fitur (login) tidak berfungsi tanpa sesi.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          5. Penyimpanan & keamanan
        </h2>
        <p>
          Data disimpan selama akun aktif atau selama wajib hukum/retensi
          transaksi. Kami menerapkan kontrol akses dan praktik keamanan
          wajar; tidak ada sistem yang 100% bebas risiko.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          6. Hak Anda
        </h2>
        <p>
          Anda dapat meminta akses, koreksi, atau penghapusan data (dengan
          batasan kewajiban hukum dan retensi). Hubungi CS lewat saluran
          resmi di situs.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          7. Anak di bawah umur
        </h2>
        <p>
          Layanan ditujukan untuk pelaku usaha. Kami tidak sengaja
          mengumpulkan data anak di bawah 18 tahun tanpa persetujuan
          orang tua/wali.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-highlighted mb-3">
          8. Perubahan
        </h2>
        <p>
          Kebijakan ini dapat diperbarui. Versi terbaru selalu di halaman
          ini. Penggunaan berkelanjutan berarti Anda memahami kebijakan
          yang berlaku.
        </p>
      </section>
    </div>
  </UContainer>
</template>
