# GENIUS ASSESSMENT

Aplikasi asesmen digital berbasis HTML, CSS, JavaScript, dan Bootstrap untuk Bahasa Indonesia SMK kelas XI (materi teks prosedur). Dirancang sebagai situs statis sehingga dapat dipublikasikan melalui GitHub Pages.

## Isi folder
- `index.html` — struktur halaman dan komponen antarmuka.
- `styles.css` — desain responsif, warna biru-kuning-putih, animasi ringan, dan gaya cetak.
- `app.js` — validasi identitas, pengacakan soal dan opsi, timer 90 menit, penguncian jawaban, umpan balik, serta perhitungan nilai.
- `questions.js` — 40 butir soal beserta opsi, penanda jawaban benar, pembahasan, dan tingkat kesulitan.

## Menjalankan secara lokal
1. Ekstrak folder/ZIP.
2. Buka `index.html` di browser modern. Untuk hasil paling konsisten, jalankan melalui server lokal sederhana, misalnya ekstensi Live Server di VS Code.
3. Koneksi internet diperlukan agar Bootstrap dan Bootstrap Icons dari CDN dapat dimuat.

## Publikasi melalui GitHub Pages
1. Masuk ke GitHub dan buat repository baru, misalnya `genius-assessment`.
2. Unggah **isi folder** ini ke root repository: `index.html`, `styles.css`, `app.js`, `questions.js`, dan `README.md`.
3. Buka **Settings → Pages** pada repository.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/(root)`, lalu klik **Save**.
6. Tunggu proses deployment selesai. URL situs akan tampil pada bagian Pages, biasanya `https://USERNAME.github.io/genius-assessment/`.

## Perilaku aplikasi
- Identitas nama, NIS, dan kelas wajib diisi sebelum asesmen dimulai.
- Timer dimulai saat tombol **Mulai Asesmen** ditekan; batas waktu 90 menit.
- Setiap sesi mengacak urutan 40 soal dan urutan opsi. Penanda `correct` melekat pada setiap objek opsi selama pengacakan sehingga kunci tidak tertukar.
- Siswa hanya dapat memilih satu jawaban pada setiap soal. Setelah dipilih, opsi terkunci dan umpan balik ditampilkan.
- Nilai = (jawaban benar / 40) × 100. Soal yang tidak dijawab ketika waktu habis dihitung salah, sehingga nilai tetap konsisten dari skala 0–100.
- Hasil dapat dicetak melalui tombol **Cetak Hasil**.
- Identitas dan hasil tidak dikirim ke server; aplikasi tidak memiliki backend atau penyimpanan nilai terpusat.

## Catatan penting untuk penggunaan resmi
Ini adalah aplikasi front-end statis. Karena seluruh kode berjalan di browser, aplikasi tidak dapat menjamin keamanan ujian tingkat tinggi, mencegah semua bentuk manipulasi oleh pengguna mahir, atau menyimpan hasil siswa secara terpusat. Untuk ujian resmi yang membutuhkan rekam nilai terpusat, autentikasi, atau anti-kecurangan, tambahkan backend dan kontrol akses. Pastikan bank soal ditinjau guru sebelum digunakan.
