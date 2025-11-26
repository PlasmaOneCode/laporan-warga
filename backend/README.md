# Laporan Warga Backend (Express + MongoDB)

Express.js backend for the Laporan Warga frontend app.

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally or a connection string

## Setup

1. Copy `.env.example` to `.env` and fill the settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rtrw_reports
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:8080
```

2. Install dependencies

```bash
cd backend
npm install
```

3. Seed DB (optional)

```bash
npm run seed
```

4. Start server in dev mode

```bash
npm run dev
```

Server will run on `http://localhost:5000` by default.

## Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/reports` - List
- `GET /api/reports/stats` - Stats
- `GET /api/reports/:id` - Get details
- `POST /api/reports` - Create (Auth required, images via multipart/form-data)
- `PUT /api/reports/:id` - Update (Auth, Owner or Admin)
- `PATCH /api/reports/:id/status` - Update status (Auth, Owner or Admin)
- `DELETE /api/reports/:id` - Delete (Auth, Owner or Admin)

## Notes
- Images are saved to `UPLOAD_PATH` and served statically at `/uploads/filename`.
- Returned image URLs for the client are absolute URLs built from request host.
- The frontend expects base API path `/api` so the server uses `/api` prefix.

## Error format

Errors are returned with the format:

```json
{ "message": "User-friendly message", "error": "(stacktrace only in development)" }
```

## License
MIT
