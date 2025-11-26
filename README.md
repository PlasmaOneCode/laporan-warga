# Sistem Pelaporan Lingkungan RT/RW

Platform digital untuk melaporkan dan mengelola masalah lingkungan di sekitar RT/RW. Dibangun dengan React + Vite, Tailwind CSS, dan TypeScript.

Note: Frontend project sekarang berada di folder `frontend/` dan backend berada di `backend/`.

## 🧭 Problem Statement (Masalah yang Diselesaikan)

Di banyak lingkungan RT/RW, warga sering menemui masalah lokal seperti lampu jalan mati, jalan berlubang, dan sampah yang menumpuk, namun belum ada saluran pelaporan yang mudah, terpusat, dan terdokumentasi. Informasi yang masuk seringkali tidak terstruktur, tidak ada cara melacak status perbaikan, dan sulit bagi pengurus RT/RW atau pihak berwenang untuk memantau dan merespons laporan secara cepat.

Masalah yang biasanya muncul:
- Kurangnya saluran yang mudah untuk mengirim laporan dengan detail dan bukti (foto)
- Tidak ada mekanisme tracking/status untuk laporan
- Kesulitan manajemen data dan statistik bagi admin/dinas
- Tidak ada sistem autentikasi untuk membatasi akses update/edit hanya oleh pemilik atau admin

## 💡 Solution Overview (Solusi yang Dibuat)

Proyek ini membuat sebuah platform pelaporan lingkungan RT/RW yang menyediakan:
- Form laporan yang mendukung multi-image upload (preview sebelum submit)
- Autentikasi JWT untuk user & admin (role-based access)
- Halaman dashboard dan statistik untuk admin
- Fitur CRUD untuk laporan (create, read, update, delete)
- Penyimpanan gambar melalui upload server (dan rekomendasi migrasi ke cloud storage untuk production)
- Filter, pencarian, dan kategori laporan untuk mempermudah manajemen
- Integrasi peta untuk menandakan lokasi laporan (opsional jika user mengisi latitude/longitude)

Arsitektur singkat:
- Frontend: React + Vite + TypeScript + Tailwind — UI, forms, file preview, routing
- Backend: Node.js + Express + MongoDB (Mongoose) — REST API, auth, upload handling
- Penyimpanan gambar: local folder `backend/uploads/` (dev) dan rekomendasi Cloudinary/S3 untuk production

Solusi ini memudahkan warga melaporkan permasalahan, dan memudahkan pengurus RT/RW untuk melacak serta menindaklanjuti laporan tersebut.

## ⚡ Quickstart (Ringkasan Cepat Menjalankan Project)

Langkah singkat untuk menjalankan aplikasi pada mesin development: pastikan Node.js dan npm sudah terinstal.

1) Backend (jalankan di terminal 1):

```bash
cd backend
cp .env.example .env # membuat .env lokal (atau set environment variables)
npm install
npm run seed # optional, isi data contoh
npm run dev
```

2) Frontend (jalankan di terminal 2):

```bash
cd frontend
cp .env.example .env # jika ada
npm install
npm run dev
```

3) Akses:
- Frontend: http://localhost:8080 atau LAN address (lihat output Vite)
- Backend API: http://localhost:5000/api

Alternatif (tanpa menginstall MongoDB lokal): jalankan MongoDB via Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:6.0
```

Atau gunakan MongoDB Atlas — update `backend/.env` `MONGODB_URI` dengan connection string Atlas.

## 🚀 Fitur Utama

- **Autentikasi JWT**: Login dan Register dengan token-based authentication
- **Manajemen Laporan**: CRUD lengkap untuk laporan lingkungan
- **Upload Gambar**: Multi-image upload dengan preview (max 4 gambar, 5MB per file)
- **Filter & Search**: Pencarian dan filter berdasarkan kategori dan status
- **Dashboard Admin**: Statistik dan manajemen laporan untuk admin
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Feedback**: Toast notifications untuk setiap aksi

## 📦 Teknologi

- **React 18** with Vite
- **TypeScript**
- **Tailwind CSS** untuk styling
- **Shadcn/ui** untuk komponen UI
- **Axios** untuk HTTP requests dengan interceptor
- **React Router** untuk navigation
- **Context API** untuk state management
- **date-fns** untuk format tanggal
- **React Leaflet** (optional) untuk integrasi peta

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 16+ dan npm/yarn

### Langkah-langkah

1. **Clone repository**

```bash
git clone https://github.com/PlasmaOneCode/laporan-warga
cd laporan-warga
```

2. **Install dependencies**

Project ini sekarang menggunakan struktur terpisah untuk frontend dan backend (folder `frontend/` dan `backend/`). Install dependencies masing-masing subproject seperti berikut:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
Optional: Jika backend menyediakan seed, jalankan seed untuk membuat akun testing dan data contoh:

```bash
cd backend
npm run seed
```

```

Jika Anda ingin menjalankan keduanya dari root dengan satu perintah, Anda bisa menambahkan skrip `workspaces` (opsional):

```json
// contoh isi `package.json` root (opsional untuk monorepo)
{
	"private": true,
	"workspaces": ["frontend", "backend"],
	"scripts": {
		"dev": "concurrently \"npm run dev --workspace=backend\" \"npm run dev --workspace=frontend\""
	}
}
```

3. **Setup environment variables**

Berikut adalah lokasi environment variables yang dipakai oleh setiap subproject:

- Backend: buat file `backend/.env` dengan variabel yang dibutuhkan (contoh):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/laporan_warga
JWT_SECRET=supersecretkey
```

- Frontend: buat file `frontend/.env` (prefix `VITE_` dibutuhkan untuk Vite):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Catatan: Vite hanya membaca env variables yang diawali `VITE_`.

4. **Run development server**

Jalankan backend dan frontend secara terpisah (membutuhkan dua terminal):

```bash
# Terminal 1: backend
cd backend
npm run dev

# Terminal 2: frontend
cd frontend
npm run dev
```

Frontend biasanya berjalan di `http://localhost:5173` (default Vite). Jika Anda menambahkan skrip monorepo di root (opsional), jalankan saja `npm run dev` di root.

## 📁 Struktur Folder

```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── postcss.config.js
├── tailwind.config.ts
├── public/
└── src/
	├── components/
│   ├── Layout/
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Common/
│   │   ├── StatusBadge.tsx
│   │   └── CategoryBadge.tsx
│   └── ui/              # Shadcn UI components
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   ├── axios.ts         # Axios instance dengan interceptor
│   └── utils.ts
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── reports/
│   │   ├── NewReport.tsx
│   │   └── ReportDetail.tsx
│   ├── admin/
│   │   └── AdminDashboard.tsx
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   └── NotFound.tsx
	└── App.tsx
backend/
├── package.json
├── server.js
├── controllers/
├── models/
├── middleware/
├── routes/
├── uploads/
└── seed.js
```

## 🔌 API Endpoints (Backend Contract)

Aplikasi ini mengharapkan backend REST API dengan endpoint berikut:

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### Reports

- `GET /api/reports` - Get list laporan (support query params: search, category, status, page, limit)
- `GET /api/reports/stats` - Get statistik laporan
- `GET /api/reports/:id` - Get detail laporan
- `POST /api/reports` - Create laporan baru (multipart/form-data)
- `PUT /api/reports/:id` - Update laporan
- `PATCH /api/reports/:id/status` - Update status laporan
- `DELETE /api/reports/:id` - Delete laporan

Detail request/response format ada di dokumentasi backend.

## 👤 User Roles

- **User**: Dapat membuat, melihat, edit, dan delete laporan sendiri
- **Admin**: Semua akses user + dapat mengelola semua laporan dan melihat dashboard admin

## 🎨 Design System

Aplikasi menggunakan design system berbasis semantic tokens:

- **Primary**: Hijau environmental theme
- **Secondary**: Biru untuk trust dan civic duty
- **Accent**: Orange untuk alerts/urgency
- **Success/Warning/Info**: Status indicators

Semua warna didefinisikan dalam `frontend/src/index.css` menggunakan HSL values dan diakses via Tailwind CSS.

## 🔐 Authentication Flow

1. User login/register → Backend returns JWT token
2. Token disimpan di `localStorage`
3. Axios interceptor otomatis menambahkan `Authorization: Bearer <token>` header
4. Jika 401 Unauthorized → Auto logout dan redirect ke login

## 📸 Upload Gambar

### Client-side Validation

- Tipe file: JPG, JPEG, PNG only
- Size: Max 5MB per file
- Jumlah: Min 1, Max 4 gambar
- Preview sebelum upload

Note: File gambar tersimpan di folder `backend/uploads/` dan dapat diakses melalui URL `http://localhost:<BACKEND_PORT>/uploads/<filename>` (mis. `http://localhost:5000/uploads/example.jpg`).

### Upload Format

Menggunakan `FormData` dengan field `images` (multiple files).

## 🚢 Deployment

### Build untuk production

Build untuk frontend (Vite):

```bash
cd frontend
npm run build
```

Output frontend akan berada di `frontend/dist/`.

Backend: backend adalah Node/Express — tidak butuh step build bila menjalankan langsung dengan Node/Nodemon.

### Deploy ke Vercel (contoh)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

Jangan lupa set environment variable `VITE_API_BASE_URL` di dashboard Vercel (contoh `https://api.domain.com/api`). Jika Anda mer-deploy backend dan frontend terpisah, pastikan Base URL diarahkan ke backend yang sudah dideploy.

Note: Kalau Anda mendeploy frontend saja (mis. **Vercel**), gunakan `frontend/dist/` sebagai build output atau atur project root ke `frontend/` di Vercel settings.

## Lockfiles & Package Manager

- `frontend/package-lock.json` berada di folder `frontend` dan `backend/package-lock.json` di `backend` — ini adalah lockfile tiap subproject.
- Root `package-lock.json` hanya diperlukan jika Anda ingin menyimpan konfigurasi root-level (opt-in). Jika menggunakan `npm workspaces`, Anda dapat menyimpan lockfile di root dan gunakan `workspaces` di `package.json` root.
- `bun.lockb` hanya relevan jika menggunakan `bun`. Jika Anda tidak menggunakan bun, Anda dapat menghapus `bun.lockb` untuk menghindari kebingungan.

## 🐛 Troubleshooting (Tambahan)

### `Cannot find module '@/...'` atau error `paths`/alias

- Pastikan `vite.config.ts` di `frontend/` mengatur alias `@` ke `src`:

```ts
import path from 'path'
// ...
resolve: {
	alias: { '@': path.resolve(__dirname, 'src') }
}
```

- Pastikan `frontend/tsconfig.json` memetakan `@/*` ke `src/*`:

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": { "@/*": ["src/*"] }
	}
}
```

### `@tailwind` unknown rule / PostCSS errors

- Pastikan `postcss.config.js` dan `tailwind.config.ts` berada di `frontend/`.
- Install dependency Tailwind / PostCSS di `frontend` (`cd frontend && npm install`) dan jalankan `npm run dev` di dalam folder itu.

### `vite` not found or ERESOLVE peer dependency errors

- Kalau `vite` tidak ditemukan, jalankan `cd frontend && npm install` agar devDeps di frontend terinstal.
- Jika Anda menemui masalah `ERESOLVE` atau peer dependency conflict (contoh: `react-leaflet` membutuhkan React 19), hapus package bermasalah dari `frontend/package.json` jika tidak dipakai, atau upgrade React jika perlu.


Jika masih menemui error, jalankan `npm install` di subproject masing-masing, lalu `npm run dev` di subproject terkait.

### Tips: TypeScript & path alias (`@`)

- Jika frontend dipindah ke `frontend/`, buat `frontend/tsconfig.json` yang me-extend root `tsconfig.json` (jika ada) atau sediakan `paths` untuk `@/*` pointing to `src/*`.
- Contoh `frontend/tsconfig.json`:

```json
{
	"extends": "../tsconfig.json",
	"compilerOptions": {
		"baseUrl": ".",
		"paths": { "@/*": ["src/*"] }
	},
	"include": ["src"]
}
```

Ini membuat import alias `@/` bekerja dengan baik di editor dan build.

## 🐛 Troubleshooting

### CORS Error

Pastikan backend Anda mengizinkan CORS dari domain frontend.

### 401 Unauthorized

- Cek token di localStorage
- Pastikan backend menerima format `Authorization: Bearer <token>`
- Cek apakah token sudah expired

### Image Upload Gagal

- Cek ukuran file (max 5MB)
- Pastikan backend mendukung multipart/form-data
- Cek network tab di browser untuk detail error

### MongoDB Connection (ECONNREFUSED)

- Jika backend Anda gagal connect ke MongoDB (`ECONNREFUSED`), pastikan MongoDB sudah berjalan di mesin lokal atau gunakan Docker. Contoh perintah Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:6.0
```

Atau jalankan layanan MongoDB pada Windows (jika terinstal sebagai service):

```powershell
net start MongoDB
```

## 📝 Test Credentials

Untuk testing, gunakan credentials berikut (jika backend sudah di-seed):

```
Email: admin@test.com
Password: admin123
Role: admin

Email: user@test.com
Password: user123
Role: user
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

Untuk pertanyaan atau issue, silakan buka GitHub Issues atau hubungi maintainer.

---

**Happy Coding! 🚀**
