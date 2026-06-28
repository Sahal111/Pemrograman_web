<div align="center">

<!-- TIPS: Taruh file GIF demo aplikasi kamu di folder docs/images/ dengan nama demo.gif -->
<img src="docs/images/dashboard.png" alt="TaskFlow Banner" width="100%" style="border-radius: 10px;" />

# 🚀 TaskFlow

**Sistem Manajemen Proyek & Tugas IT yang Terintegrasi dan Kolaboratif**

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

<p align="center">
  <a href="#--overview">Overview</a> •
  <a href="#--features">Features</a> •
  <a href="#--tech-stack">Tech Stack</a> •
  <a href="#--getting-started">Installation</a> •
  <a href="#--api-reference">API Docs</a> •
  <a href="#--screenshots">Screenshots</a>
</p>

</div>

---

## 📖 Overview

**TaskFlow** adalah aplikasi manajemen proyek berbasis web modern yang dirancang untuk memfasilitasi kolaborasi siklus pengembangan perangkat lunak (SDLC) antara **Project Manager (PM)**, **Developer**, dan **Quality Assurance (QA)**. 

Dibangun menggunakan arsitektur *Decoupled* (**Laravel 11** sebagai Headless REST API dan **React.js** sebagai Single Page Application), TaskFlow memecahkan masalah fragmentasi komunikasi dengan menyatukan pelacakan progres tugas (*Kanban*), diskusi instruksional, dan manajemen berkas dalam satu platform sentral.

---

## ✨ Features

- [x] **Secure Authentication** — Autentikasi token berlapis menggunakan *Laravel Sanctum*.
- [x] **Role-Based Access Control (RBAC)** — Hak akses eksklusif yang membedakan kapabilitas PM, Dev, dan QA.
- [x] **Closed Onboarding System** — Registrasi anggota tim diamankan menggunakan sistem *Unique Invite Code*.
- [x] **Interactive Kanban Board** — Visualisasi alur kerja (*To Do, In Progress, Review, Done*) secara dinamis.
- [x] **Task Thread Discussions** — Resolusi masalah dan revisi langsung pada kartu tugas terkait.
- [x] **File Attachments** — Pendukung lampiran dokumen spesifikasi maupun bukti *bug*.
- [x] **Executive Dashboard** — Kalkulasi metrik produktivitas tim dan kalender tenggat waktu terintegrasi.

---

## 📐 System Architecture

```mermaid
graph TD
    Client[React SPA / Vite] -->|Axios HTTP / Bearer Token| API[Laravel 11 REST API]
    API -->|Eloquent ORM| DB[(MySQL Database)]
    API -->|Gate & Policy| RBAC{Sanctum Middleware}
    
    RBAC -->|Role: PM| Admin[Project Creation & Invite Codes]
    RBAC -->|Role: Dev| Board[Kanban Updates & Attachments]
    RBAC -->|Role: QA| Review[Task Verification & Comments]
