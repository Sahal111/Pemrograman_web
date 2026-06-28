# ************************************************************
# Sequel Ace SQL dump
# Version 20096
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: 127.0.0.1 (MySQL 9.6.0)
# Database: db_task_m
# Generation Time: 2026-06-28 17:26:50 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table attachments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `attachments`;

CREATE TABLE `attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `task_id` int DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `task_id` (`task_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attachments_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attachments_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;

INSERT INTO `attachments` (`id`, `project_id`, `task_id`, `file_name`, `file_path`, `uploaded_by`, `created_at`)
VALUES
	(1,1,NULL,'kunci-inggris.jpg','attachments/YxLEC7C43K4W8qz7q1eziBB5NmeGr7DckxwR99a5.jpg',1,'2026-06-27 01:35:42'),
	(2,1,NULL,'kmeans_hasil_segmentasi.csv','attachments/4nGQTJ7L8H3WZ2e5ultYlcnYSAjXuQLw7lfZgCPf.csv',1,'2026-06-27 09:28:09');

/*!40000 ALTER TABLE `attachments` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table cache
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cache`;

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table cache_locks
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cache_locks`;

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table comments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `comments`;

CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `user_id` int NOT NULL,
  `komentar` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;

INSERT INTO `comments` (`id`, `task_id`, `user_id`, `komentar`, `created_at`)
VALUES
	(1,1,1,'Schema sudah selesai, siap review','2026-06-27 01:28:52');

/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table failed_jobs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `failed_jobs`;

CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table invite_codes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `invite_codes`;

CREATE TABLE `invite_codes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('pm','developer','qa') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `used_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invite_codes_code_unique` (`code`),
  KEY `invite_codes_created_by_foreign` (`created_by`),
  KEY `invite_codes_used_by_foreign` (`used_by`),
  CONSTRAINT `invite_codes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invite_codes_used_by_foreign` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `invite_codes` WRITE;
/*!40000 ALTER TABLE `invite_codes` DISABLE KEYS */;

INSERT INTO `invite_codes` (`id`, `code`, `role`, `is_used`, `created_by`, `used_by`, `created_at`)
VALUES
	(1,'XM6Y1JWD','developer',1,1,4,'2026-06-27 13:55:41'),
	(2,'ERNKDEEW','developer',0,1,NULL,'2026-06-27 14:07:19'),
	(3,'Q6IDHCMZ','qa',0,1,NULL,'2026-06-27 15:18:06'),
	(4,'QAIUAA75','developer',1,1,5,'2026-06-27 15:18:13'),
	(5,'A4MGN0CV','qa',1,1,6,'2026-06-28 08:39:33');

/*!40000 ALTER TABLE `invite_codes` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table job_batches
# ------------------------------------------------------------

DROP TABLE IF EXISTS `job_batches`;

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table jobs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `jobs`;

CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table migrations
# ------------------------------------------------------------

DROP TABLE IF EXISTS `migrations`;

CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;

INSERT INTO `migrations` (`id`, `migration`, `batch`)
VALUES
	(1,'0001_01_01_000000_create_users_table',1),
	(2,'0001_01_01_000001_create_cache_table',1),
	(3,'0001_01_01_000002_create_jobs_table',1),
	(4,'2026_06_26_145348_create_personal_access_tokens_table',1),
	(5,'2026_06_27_124129_add_profile_fields_to_users_table',2),
	(6,'2026_06_27_133902_add_status_to_users_table',3),
	(7,'2026_06_27_133902_create_invite_codes_table',4);

/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table password_reset_tokens
# ------------------------------------------------------------

DROP TABLE IF EXISTS `password_reset_tokens`;

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table personal_access_tokens
# ------------------------------------------------------------

DROP TABLE IF EXISTS `personal_access_tokens`;

CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`)
VALUES
	(1,'App\\Models\\User',1,'auth_token','ac70bc3aee8a02c4f1071022f7afb033d08b96161c5d44fd1a9b820495fdfaba','[\"*\"]','2026-06-27 01:35:48',NULL,'2026-06-26 15:19:28','2026-06-27 01:35:48'),
	(3,'App\\Models\\User',1,'auth_token','7dd763ace0bdab0e55671d965d3dec63347128735981e37a1c13ddd34e811488','[\"*\"]','2026-06-27 03:11:09',NULL,'2026-06-27 03:05:28','2026-06-27 03:11:09'),
	(6,'App\\Models\\User',1,'auth_token','e92d7d36cbf7d03c99577422ef9cace840ff1429382670a688ee014c2e596286','[\"*\"]','2026-06-27 08:27:26',NULL,'2026-06-27 08:04:25','2026-06-27 08:27:26'),
	(7,'App\\Models\\User',1,'auth_token','2ea8a3a63a42a4f4fb3adf053b4eacbdc5a7c17bef6cabf3b5a39b24d32e4cf5','[\"*\"]','2026-06-27 11:47:17',NULL,'2026-06-27 09:03:07','2026-06-27 11:47:17'),
	(8,'App\\Models\\User',1,'auth_token','f7077ed92b7d76c70dc2ef755c8f55afbb033ec305f9ad462c15fa43719b55f4','[\"*\"]','2026-06-27 12:09:33',NULL,'2026-06-27 12:03:00','2026-06-27 12:09:33'),
	(9,'App\\Models\\User',1,'auth_token','0cc130e157485aac6defc6e8f6190bac9b917c8c651d1cadac13085244a7d70c','[\"*\"]','2026-06-27 12:35:16',NULL,'2026-06-27 12:22:05','2026-06-27 12:35:16'),
	(10,'App\\Models\\User',3,'auth_token','ebd2fbc4b006f00a7ecedb19a6cd98352bbd6a0dc0bf29e2059242ec58a9e54b','[\"*\"]','2026-06-27 12:36:45',NULL,'2026-06-27 12:35:45','2026-06-27 12:36:45'),
	(11,'App\\Models\\User',1,'auth_token','f23adc3215126142334e7f4f136acf23757c5f457096f5875cae393e43da8767','[\"*\"]','2026-06-27 12:44:38',NULL,'2026-06-27 12:37:29','2026-06-27 12:44:38'),
	(12,'App\\Models\\User',1,'auth_token','aa6d57888da714b2bab2d9bd4d8800d639b9fa146bb6370acb90808da24dc351','[\"*\"]','2026-06-27 13:09:31',NULL,'2026-06-27 12:48:56','2026-06-27 13:09:31'),
	(13,'App\\Models\\User',3,'auth_token','a6dc77be38adfc3e94e19837f77103547adb2f5ac0699364ef4197f81ce61cf8','[\"*\"]','2026-06-27 13:11:23',NULL,'2026-06-27 13:09:55','2026-06-27 13:11:23'),
	(14,'App\\Models\\User',2,'auth_token','ebe13dc76b857d57fa35eaea5b5bae74d2d118f62f98eecbb381b4c27678ac22','[\"*\"]','2026-06-27 13:35:42',NULL,'2026-06-27 13:12:02','2026-06-27 13:35:42'),
	(15,'App\\Models\\User',1,'auth_token','34a2d598c6d4a291e71d2a87c18763fe89331fc8a21e089b7aafd5e4373edca9','[\"*\"]','2026-06-27 13:59:30',NULL,'2026-06-27 13:54:42','2026-06-27 13:59:30'),
	(16,'App\\Models\\User',4,'auth_token','49569f4d9e1ce7d45ef58fe2143edbe7b0385f10c625782e66f1c3bb7e4f1eea','[\"*\"]',NULL,NULL,'2026-06-27 14:00:37','2026-06-27 14:00:37'),
	(17,'App\\Models\\User',1,'auth_token','4542acc41e4ca09e15ef38d23344f802642ec55e3c19794f4df8669f4ca50255','[\"*\"]','2026-06-27 14:07:19',NULL,'2026-06-27 14:06:30','2026-06-27 14:07:19'),
	(18,'App\\Models\\User',1,'auth_token','ed966470fca26e99110c0a17db44eaaad1cca81cef31092e88dcfd2b997d230f','[\"*\"]','2026-06-27 15:19:13',NULL,'2026-06-27 14:58:50','2026-06-27 15:19:13'),
	(19,'App\\Models\\User',1,'auth_token','995b93f6784835157653c687fbe8f2a37f27575a2883cad251f30a42d901d3e2','[\"*\"]','2026-06-27 20:09:47',NULL,'2026-06-27 18:21:46','2026-06-27 20:09:47'),
	(20,'App\\Models\\User',2,'auth_token','0e279ab7529db63db50df4f07801197859b1b3371d51d899089ccac2d0c0f712','[\"*\"]','2026-06-27 20:11:19',NULL,'2026-06-27 20:10:40','2026-06-27 20:11:19'),
	(21,'App\\Models\\User',1,'auth_token','07893a4a9b440a5117f340e6f3d9b0fa9f9a864803e5d3365201cbebd8f43584','[\"*\"]','2026-06-27 20:34:12',NULL,'2026-06-27 20:11:31','2026-06-27 20:34:12'),
	(22,'App\\Models\\User',1,'auth_token','b45f765b5462b2af729978f354c83fefca6812d771cfb519039498d2f99c9ea7','[\"*\"]','2026-06-27 20:38:08',NULL,'2026-06-27 20:36:45','2026-06-27 20:38:08'),
	(23,'App\\Models\\User',5,'auth_token','498c2a9f0588ef4e9c8950db3bffd78160cd42d31c57a5a0d4f61eb5e740b3b2','[\"*\"]','2026-06-27 20:39:51',NULL,'2026-06-27 20:38:32','2026-06-27 20:39:51'),
	(24,'App\\Models\\User',1,'auth_token','8407a6549e4cf24637d72e2a1b5aa44b6bdb05d7720579b93e7df719bcedfc10','[\"*\"]','2026-06-27 20:53:44',NULL,'2026-06-27 20:40:01','2026-06-27 20:53:44'),
	(25,'App\\Models\\User',1,'auth_token','96dfc059ff54087250303660bfa9bc6a13f0f1d4e41189b5aeffa37cb440d817','[\"*\"]','2026-06-28 09:42:14',NULL,'2026-06-28 07:55:18','2026-06-28 09:42:14'),
	(26,'App\\Models\\User',1,'auth_token','5d50334b4c940593a0913b8f4bd81163329d6c65adf78cb8eff84ff683dc8d42','[\"*\"]','2026-06-28 08:45:59',NULL,'2026-06-28 08:45:03','2026-06-28 08:45:59'),
	(27,'App\\Models\\User',1,'auth_token','7c436673e7b77475a19d1bede14f3083634b38e768dcde4c8f576526ce6ce2bf','[\"*\"]','2026-06-28 13:30:42',NULL,'2026-06-28 10:01:30','2026-06-28 13:30:42'),
	(28,'App\\Models\\User',1,'auth_token','50160093f729cbb5e1b58a923fbbac2613afb529102812fc411111fcf5e774c3','[\"*\"]','2026-06-28 16:02:43',NULL,'2026-06-28 14:29:26','2026-06-28 16:02:43'),
	(29,'App\\Models\\User',1,'auth_token','8cc0b526a9cb3a800051f840d8b3c8289910ba8ebbd7d9fe788c8c3950fcd235','[\"*\"]','2026-06-28 16:15:43',NULL,'2026-06-28 16:15:41','2026-06-28 16:15:43'),
	(30,'App\\Models\\User',1,'auth_token','100f1d3548cfdafda72b7be987a49f7f79628b9d36645ee294a4be3a5b7a9bdb','[\"*\"]','2026-06-28 16:17:23',NULL,'2026-06-28 16:17:11','2026-06-28 16:17:23'),
	(31,'App\\Models\\User',6,'auth_token','c380b1302c9380cac42b49a6a8c0e5bacdea505083d0c6fe040f4af3e1c9442d','[\"*\"]','2026-06-28 16:18:21',NULL,'2026-06-28 16:17:38','2026-06-28 16:18:21');

/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table project_members
# ------------------------------------------------------------

DROP TABLE IF EXISTS `project_members`;

CREATE TABLE `project_members` (
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`project_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;

INSERT INTO `project_members` (`project_id`, `user_id`)
VALUES
	(1,1),
	(1,2),
	(4,3),
	(4,4),
	(4,5);

/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table projects
# ------------------------------------------------------------

DROP TABLE IF EXISTS `projects`;

CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_proyek` varchar(100) NOT NULL,
  `client` varchar(100) NOT NULL,
  `deskripsi` text,
  `status` enum('planning','ongoing','done') DEFAULT 'planning',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;

INSERT INTO `projects` (`id`, `nama_proyek`, `client`, `deskripsi`, `status`, `priority`, `start_date`, `end_date`, `created_by`)
VALUES
	(1,'Website Toko Online','PT Maju Jaya','bvhvghvgcfuffyfghhghgygygygygygygygyybyb','ongoing','high','2026-06-01','2026-08-01',1),
	(4,'bikin web perusahaan','jokowi','bgyyuuttuiitutyuiyuiyioyiyioyiouiuijbnbnbjggguguuiiihjh','ongoing','high','2026-06-07','2026-06-30',1);

/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sessions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



# Dump of table tasks
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tasks`;

CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `assigned_to` int DEFAULT NULL,
  `nama_tugas` varchar(150) NOT NULL,
  `deskripsi` text,
  `start_date` date DEFAULT NULL,
  `status` enum('todo','inprogress','review','done') DEFAULT 'todo',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;

INSERT INTO `tasks` (`id`, `project_id`, `assigned_to`, `nama_tugas`, `deskripsi`, `start_date`, `status`, `priority`, `due_date`, `created_at`)
VALUES
	(1,1,2,'jhhigugiuggi',NULL,NULL,'review','high','2026-07-01','2026-06-26 15:37:30'),
	(2,1,1,'Setup database schema',NULL,NULL,'review','high','2026-07-01','2026-06-26 15:37:40'),
	(5,1,1,'bhjbjhbhvhvhjvhjvhj','tyftfdtdtydtydtdytghffftyfytftyffufyfyfyufuyfuyf',NULL,'review','medium','2026-05-30','2026-06-27 10:20:37'),
	(6,4,3,'Database','harusss beres dengan baik',NULL,'done','high','2026-06-17','2026-06-28 10:04:04'),
	(7,4,4,'backend',NULL,NULL,'done','medium','2026-06-21','2026-06-28 10:07:20'),
	(8,4,5,'frontend','nbhjgjggkgkgjjhhjh',NULL,'done','low','2026-06-21','2026-06-28 10:07:58');

/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('pm','developer','qa') NOT NULL,
  `status` enum('pending','active') NOT NULL DEFAULT 'active',
  `job_title` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `bio` text,
  `phone` varchar(20) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `status`, `job_title`, `department`, `bio`, `phone`, `timezone`, `photo`, `created_at`)
VALUES
	(1,'admin1wewewwd','admin@example.com','$2y$12$TNtRRQEJ3ThqJL.9zOKRj.TRGoIw3irIvGxTyjPOPe3riWsjIEflq','pm','active','Junior Project manager','Enginering Ops','dshgghghgehfguguehdbbjbjhjshdjhjhjehuyuyudhdjcjjdjjbdc','085811723878','(GMT+07:00) Western Indonesia Time','profile-photos/G2uhFXHyPBmOWMZt5OLOiTy3ij90lCeAWFN0suyU.png','2026-06-26 15:04:02'),
	(2,'admin','admin@gmail.com','$2y$12$eiG2ep5xgRxPvx1n9G8Rl.Bqxx7H15ozmf6LbixuDEol8kUY/qjQ.','developer','active',NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-27 03:16:17'),
	(3,'mamat123','mamat@gmail.com','$2y$12$09r8wfLEqVFxLPYXSavWy.96BokM7Av0sHahhBTgjexPjJcGtjFnO','qa','active',NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-27 12:35:45'),
	(4,'testdev','testdev@example.com','$2y$12$GHN0FVU8g6HJ095RuIGUVuamd/ZPatHuLsIO4wz/MQDH40eibPXjm','developer','active',NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-27 13:56:54'),
	(5,'dev','dev@gmail.com','$2y$12$/Obka6ydOkTCpErca53vXOMcN7nZhBeK1UJS6oZuSp48PS9SVK/2e','developer','active',NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-27 20:36:28'),
	(6,'qatest','qatest@gmail.com','$2y$12$EPcusQwJWIXYzGJJ82.YXuFkbV6j2BvbM/uxiPvK3Rp5sZFfHLSju','qa','active',NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-28 16:16:40');

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
