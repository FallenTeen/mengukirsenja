Mengukir Senja

Website dan sistem pengelolaan pesanan untuk Mengukir Senja Decoration.

Fungsi Utama

Public Website

Profil Mengukir Senja Decoration

Katalog paket Decoration

Katalog Partner Services

Portfolio pekerjaan

Detail paket dan portfolio

Pengajuan pesanan dari katalog

Pengajuan custom order

Admin Panel

Dashboard operasional

Kalender pesanan

Membuat pesanan secara manual

Mengelola customer

Mengelola katalog

Mengelola portfolio

Mengelola partner services

Mengubah dan menyesuaikan isi pesanan

Mengirim akses customer melalui Magic Link

Membuka percakapan WhatsApp dari order

Customer Portal

Login menggunakan Magic Link

Melihat pesanan

Melihat detail acara

Melihat layanan dan item pesanan

Melihat estimasi total

Melihat catatan yang dibagikan admin

Mengonfirmasi pesanan

Menghubungi admin melalui WhatsApp

Model Layanan

Core

Decoration — Mengukir Senja Decoration

Partner Services

Soundsystem — Basssound

Tenda

Fotografer

Layur

Customer dapat memiliki pesanan tanpa akun. Akun portal hanya diperlukan ketika customer membutuhkan akses ke detail pesanannya melalui Magic Link.

Alur Pesanan

Catalog Request
        │
Custom Request
        │
Admin Manual Order
        ▼
      Order
        ▼
Admin Review & Customization
        ▼
Customer Confirmation
        ▼
     Confirmed

Pesanan yang berasal dari luar website tetap dapat dicatat melalui kalender dan panel admin.

Konfigurasi

Environment Variables

Salin `.env.example` menjadi `.env.local` lalu isi:

| Variable | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase. |
| `NEXT_PUBLIC_SITE_URL` | Origin absolut website, tanpa trailing slash. Dipakai untuk setiap tautan absolut yang dibuat server, terutama redirect Magic Link. |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | Nomor WhatsApp studio, format internasional tanpa tanda plus. |

`NEXT_PUBLIC_SITE_URL` wajib diisi di produksi. Tanpa variabel ini redirect Magic Link akan memakai header `Origin` dari request, yang pada server development berarti `http://localhost:3000` dan tidak bisa dibuka dari inbox customer.

Supabase Auth

Tiga tempat di dashboard Supabase (Authentication) harus cocok dengan `NEXT_PUBLIC_SITE_URL`, kalau tidak Supabase menolak redirect dan link tidak pernah sampai:

Site URL: `https://mengukirsenja.vercel.app`

Redirect URLs:
- `https://mengukirsenja.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback`
- `https://*-<team-or-account-slug>.vercel.app/auth/callback` (opsional, untuk preview deployment)

Email Template `Magic Link` harus memakai token hash, bukan `ConfirmationURL` bawaan. Aplikasi ini memakai PKCE, sehingga link `?code=` hanya bisa ditukar di browser yang meminta link tersebut, sedangkan customer membuka emailnya dari perangkat lain. Ganti isi template menjadi:

```html
<h2>Masuk ke portal Mengukir Senja</h2>
<p>Klik tautan di bawah untuk masuk ke pesanan Anda:</p>
<p>
  <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Masuk ke portal</a>
</p>
```

`{{ .RedirectTo }}` berisi persis `emailRedirectTo` yang dikirim aplikasi, yaitu `https://mengukirsenja.vercel.app/auth/callback?next=...`, sehingga halaman detail pesanan yang dituju tetap terbuka setelah login. Karena `RedirectTo` sudah membawa `?next=`, `token_hash` dan `type` disambung dengan `&`. Jangan meng-escape `&` menjadi `&amp;`, karena itu memutus parameter `token_hash`. Versi tanpa tujuan spesifik (selalu masuk ke `/customer`) dapat memakai `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`.

Endpoint `GET /auth/callback` memverifikasi `token_hash` lewat `verifyOtp` lalu menautkan user ke record customer berdasarkan email hasil verifikasi. Nilai `type` di-hardcode ke `email` di route, jadi query string tidak bisa memaksa jenis verifikasi lain.

Alternatif tanpa mengubah template: set `SITE_URL` Supabase ke `https://mengukirsenja.vercel.app` dan pakai `{{ .ConfirmationURL }}` bawaan. Cara itu tetap berfungsi untuk customer, tetapi kehilangan tujuan `next`, karena Supabase memverifikasi token sendiri lebih dulu lalu mengembalikan sesi di URL fragment yang tidak terbaca server.

