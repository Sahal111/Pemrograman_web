<div align="center">
  
# 🚀 TaskFlow

Sistem Manajemen Proyek & Tugas IT yang Terintegrasi dan Kolaboratif

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)]()
[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat&logo=laravel&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)]()
[![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat&logo=php&logoColor=white)]()
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat&logo=mysql&logoColor=white)]()
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

</div>

---

## 📖 Cover

**TaskFlow** adalah aplikasi manajemen proyek berbasis web modern yang dibangun menggunakan ekosistem **Laravel** di sisi *backend* dan **React** (Vite) di sisi *frontend*. Aplikasi ini dirancang khusus untuk memfasilitasi kolaborasi antara *Project Manager* (PM), *Developer*, dan *Quality Assurance* (QA) dalam siklus pengembangan perangkat lunak, menyediakan Kanban board, manajemen anggota, dan sistem otorisasi berbasis peran (RBAC).

---

## 🎯 Project Overview

* **Tujuan Project:** Menyediakan platform sentral terpadu untuk memantau siklus hidup proyek, dari inisiasi hingga penyelesaian tugas harian.
* **Latar Belakang:** Seringkali miskomunikasi terjadi akibat penggunaan berbagai platform yang terpisah antara komunikasi, pelacakan tugas, dan penyimpanan file proyek.
* **Manfaat:** Mempercepat koordinasi antar anggota tim, memastikan transparansi status setiap *task*, dan mencegah tugas yang terlewat (overdue).
* **Ruang Lingkup:** Mencakup pendaftaran pengguna berbasis sistem *invite code*, pengaturan proyek, penugasan tugas (Kanban), serta lampiran dan diskusi per-*task*.

---

## ✨ Features

✅ **Authentication & Authorization** (Sanctum)
✅ **Role-Based Access Control** (PM, Developer, QA)
✅ **User Approval System** (Registrasi via *Invite Code*)
✅ **Project Management** (CRUD, Detail Proyek)
✅ **Task Management & Kanban Board**
✅ **Task Comments & Discussions**
✅ **File Attachments**
✅ **Team Directory & User Management**
✅ **Dashboard & Reporting** (Analitik & Kalender)

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Backend** | Laravel 11 |
| **Frontend** | React 18 |
| **Database** | MySQL / SQLite |
| **CSS Framework** | TailwindCSS |
| **Build Tool** | Vite |
| **API** | REST API (Axios) |
| **Routing** | React Router DOM |

---

## 📂 Folder Structure

```text
📦 project_pemrograman_web
 ┣ 📂 Backend
 ┃ ┣ 📂 app
 ┃ ┃ ┣ 📂 Http/Controllers/Api
 ┃ ┃ ┗ 📂 Models
 ┃ ┣ 📂 database
 ┃ ┃ ┣ 📂 migrations
 ┃ ┃ ┗ 📜 db_task_m_2026-06-29.sql
 ┃ ┣ 📂 routes
 ┃ ┃ ┗ 📜 api.php
 ┃ ┗ 📜 .env
 ┗ 📂 frontend
   ┣ 📂 src
   ┃ ┣ 📂 api
   ┃ ┣ 📂 DasboardLayout
   ┃ ┣ 📂 pages
   ┃ ┣ 📜 App.jsx
   ┃ ┗ 📜 index.css
   ┗ 📜 package.json
```

---

## 🚀 Installation

Pastikan komputer Anda sudah terinstal PHP, Composer, Node.js, dan MySQL.

**1. Clone Repository**
```bash
git clone https://github.com/username/project_pemrograman_web.git
cd project_pemrograman_web
```

**2. Setup Backend (Laravel)**
```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

**3. Setup Frontend (React)**
Buka tab terminal baru.
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)
- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=taskflow_db`
- `DB_USERNAME=root`
- `DB_PASSWORD=`
- `FRONTEND_URL=http://localhost:5173` (Untuk konfigurasi CORS dan Origin)

### Frontend (`frontend/.env`)
- `VITE_API_URL=http://localhost:8000/api`

---

## 💾 Database

Aplikasi ini menggunakan sistem database relasional dengan fitur berikut:

* **Migration:** Struktur skema database lengkap (`users`, `projects`, `tasks`, `invite_codes`, `comments`, `attachments`, dll) berada di folder `database/migrations`.
* **Seeder:** Anda dapat menggunakan seeder bawaan jika ada untuk *dummy data*.
* **Relasi Utama:** 
  - `User` *has many* `Projects` (sebagai PM)
  - `Project` *has many* `Tasks`
  - `Task` *belongs to* `User` (Assignee)
  - `Task` *has many* `Comments`
* **Cara Setup Database (Backup):** File `db_task_m_2026-06-29.sql` sudah tersedia di dalam folder `Backend/database/`. Anda bisa melakukan *import* SQL secara manual melalui phpMyAdmin atau command line:
  ```bash
  mysql -u root -p taskflow_db < Backend/database/db_task_m_2026-06-29.sql
  ```

---

## 📡 API Endpoints

Berikut adalah beberapa *endpoint* REST API utama yang tersedia:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/login` | Autentikasi dan mendapatkan Sanctum token |
| `POST` | `/api/register` | Registrasi user baru menggunakan *Invite Code* |
| `GET` | `/api/me` | Mendapatkan data profil user yang sedang login |
| `GET` | `/api/projects` | Mendapatkan daftar proyek |
| `POST` | `/api/projects` | Membuat proyek baru (Hanya PM) |
| `GET` | `/api/tasks` | Mendapatkan seluruh tugas (*All tasks*) |
| `PUT` | `/api/tasks/{task}` | Update status Kanban sebuah tugas |
| `POST` | `/api/tasks/{task}/comments` | Menambahkan komentar pada tugas |
| `GET` | `/api/users/pending` | Melihat daftar user baru yang menunggu approval |
| `POST` | `/api/invite-codes` | Membuat kode invite baru (Hanya PM) |

---

## 📸 Screenshots

| Halaman Login | Dashboard Proyek |
| --- | --- |
| ![Login Placeholder](docs/images/login-placeholder.png) | ![Dashboard Placeholder](docs/images/dashboard-placeholder.png) |

| Kanban Board | Manajemen Pengguna |
| --- | --- |
| ![Tasks Placeholder](docs/images/tasks-placeholder.png) | ![Users Placeholder](docs/images/users-placeholder.png) |

---

## 💻 Development

Untuk *developer* baru yang ingin berkontribusi:
1. Pastikan menjalankan `php artisan serve` pada port `8000`.
2. Frontend berjalan di port `5173`.
3. Token autentikasi disimpan di `localStorage` pada sisi frontend.
4. Gunakan `storage:link` agar file *attachment* dan foto profil dapat diakses secara publik.

---

## 🗺 Roadmap

✅ **Authentication & Authorization**
✅ **CRUD Projects & Tasks**
✅ **Kanban Status Tracking**
✅ **Role-specific Invite Codes**
🚧 **Realtime Notifications** (Pusher / Laravel Reverb)
🚧 **Export Reports to PDF/Excel**
🚧 **Dark Mode Interface**

---

## 🤝 Contributing

1. *Fork* repository ini.
2. Buat *branch* fitur Anda (`git checkout -b feature/FiturBaru`).
3. *Commit* perubahan Anda (`git commit -m 'Menambahkan FiturBaru'`).
4. *Push* ke *branch* tersebut (`git push origin feature/FiturBaru`).
5. Buat *Pull Request*.

Pastikan kode yang ditulis mengikuti konvensi dan tidak memecah fitur (routing/API) yang sudah ada.

---

## 📄 License

Proyek ini didistribusikan di bawah lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.

---

## ✍️ Author

**Sahal Anwar Hadi** - *Senior Software Engineer*
Dibuat dengan dedikasi tinggi untuk manajemen proyek yang lebih baik.
