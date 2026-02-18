# Keamanan Backend (Security Measures)

Dokumen ini merangkum langkah-langkah keamanan yang telah diimplementasikan pada backend PointPlus.

## 1. Perlindungan HTTP (Helmet)
Menggunakan `@fastify/helmet` untuk mengatur berbagai header keamanan:
- **X-Content-Type-Options**: Mencegah MIME sniffing.
- **X-Frame-Options**: Mencegah Clickjacking.
- **Content-Security-Policy**: Membatasi sumber konten untuk mencegah XSS.
- **Strict-Transport-Security**: Memaksa penggunaan HTTPS (pada lingkungan production).

## 2. Pembatasan Permintaan (Rate Limiting)
Menggunakan `@fastify/rate-limit` untuk mencegah serangan Brute Force dan DoS.
- Default: **100 permintaan per menit** per IP.
- Mengembalikan error 429 jika melampaui batas.

## 3. Keamanan CORS
Menggunakan `@fastify/cors` dengan konfigurasi dinamis:
- Hanya mengizinkan origin yang terdaftar di `.env` (variabel `ALLOWED_ORIGINS`).
- Mendukung mode development untuk kemudahan testing.

## 4. Autentikasi Sentralisasi (JWT)
- Semua route di bawah `/api/*` (kecuali `/login` dan `/health`) dilindungi secara otomatis melalui hook global `preHandler`.
- Menggunakan `fastify-jwt` untuk verifikasi token yang aman.
- Middleware `authenticate` memberikan pesan error yang seragam jika token tidak valid.

## 5. Validasi & Sanitasi Input
- **Zod**: Digunakan untuk validasi skema input (body, query, params) pada setiap route penting.
- **Auto-trim**: Hook global `preValidation` secara otomatis membersihkan spasi (trim) pada semua input string di body request untuk mencegah data kotor.
- **Body Limit**: Membatasi ukuran request body (maksimal 10MB) dan file upload (5MB per file).

## 6. Penanganan Error yang Aman
- Error handler global menyembunyikan detail teknis (stack trace) pada lingkungan **production**.
- Detail error hanya ditampilkan jika `NODE_ENV=development`.

## 7. Perlindungan Database
- Menggunakan **Drizzle ORM** yang secara otomatis menggunakan *prepared statements* untuk mencegah SQL Injection.
- Tidak ada penggunaan `sql.raw` yang berisiko di dalam kode.

---
**Catatan Penting:**
Pasti Anda mengatur `JWT_SECRET` yang kuat dan unik di file `.env` untuk lingkungan produksi.
