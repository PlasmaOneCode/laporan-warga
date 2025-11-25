# Sistem Pelaporan Lingkungan RT/RW

Platform digital untuk melaporkan dan mengelola masalah lingkungan di sekitar RT/RW. Dibangun dengan React + Vite, Tailwind CSS, dan TypeScript.

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
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

Buat file `.env` di root project:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Sesuaikan `VITE_API_BASE_URL` dengan base URL backend API Anda.

4. **Run development server**

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:8080`

## 📁 Struktur Folder

```
src/
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

Semua warna didefinisikan dalam `src/index.css` menggunakan HSL values dan diakses via Tailwind CSS.

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

### Upload Format

Menggunakan `FormData` dengan field `images` (multiple files).

## 🚢 Deployment

### Build untuk production

```bash
npm run build
```

Output akan ada di folder `dist/`.

### Deploy ke Vercel (contoh)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

Jangan lupa set environment variable `VITE_API_BASE_URL` di dashboard Vercel.

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
