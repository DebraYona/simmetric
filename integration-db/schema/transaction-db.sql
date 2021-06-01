-- SQL dump generated using DBML (dbml-lang.org)
-- Database: MySQL
-- Generated at: 2020-10-06T18:03:49.112Z

CREATE TABLE `Order` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `service_order_id` varchar(255) UNIQUE NOT NULL,
  `contract_id` varchar(255) NOT NULL,
  `job_id` int,
  `last_mile` tinyint,
  `quantity_boxes` tinyint DEFAULT 1,
  `route_id` int,
  `client_id` int,
  `location_id` int NOT NULL,
  `type_of_charge` varchar(255),
  `status` varchar(100),
  `request_id` varchar(100),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Product` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `guide_number` varchar(255),
  `identifier` varchar(255) COMMENT 'CUD number',
  `sku` varchar(255),
  `status` int,
  `confirmed_status` int,
  `description` varchar(255),
  `price` int DEFAULT 0,
  `quantity` int DEFAULT 0,
  `last_mile` tinyint,
  `returned` tinyint,
  `travel_id` int,
  `geofence_id` int,
  `job_id` int,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Buyer` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `name` varchar(255),
  `phone_number` varchar(30),
  `email` varchar(255),
  `rut` varchar(255),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Receiver` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `name` varchar(255),
  `phone_number` varchar(30),
  `email` varchar(255),
  `rut` varchar(255),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Dropoff` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `address` varchar(255),
  `address_2` varchar(255),
  `comuna` varchar(255),
  `observations` varchar(255),
  `latitude` decimal(11,8),
  `longitude` decimal(11,8),
  `time` datetime,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Pickup` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `address` varchar(255),
  `address_2` varchar(255),
  `comuna` varchar(255),
  `observations` varchar(255),
  `latitude` decimal(11,8),
  `longitude` decimal(11,8),
  `time` datetime,
  `time_retail` datetime,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Location` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `latitude` decimal(11,8),
  `longitude` decimal(11,8),
  `address` varchar(255),
  `address_2` varchar(255),
  `comuna` varchar(255),
  `pickup_time` time,
  `contract_id` int,
  `contract_id_consolidated` int
);

CREATE TABLE `Status` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `service_order_id` varchar(255),
  `job_id` int,
  `order_id` int,
  `status` varchar(255),
  `message` varchar(255),
  `data` varchar(255),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Contract` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `email` varchar(255),
  `rut` varchar(255),
  `phone_number` varchar(30),
  `service` int DEFAULT null,
  `payment` int DEFAULT null,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `User` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `cognito_id` varchar(255),
  `first_name` varchar(255),
  `last_name` varchar(255),
  `role` int,
  `last_login` timestamp,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Travel` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `packages_quantity` int,
  `driver_user_id` varchar(255),
  `driver_name` varchar(255),
  `driver_last_name` varchar(255),
  `warehouse_user_id` varchar(255),
  `warehouse_user_name` varchar(255),
  `warehouse_user_last_name` varchar(255),
  `pickup_location` int,
  `dropoff_location` int,
  `initiated` tinyint,
  `status` int,
  `initiated_date` timestamp,
  `on_cd_date` timestamp,
  `verified_date` timestamp,
  `dispatched_date` timestamp,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Consolidation` (
  `identifier` varchar(255) UNIQUE PRIMARY KEY,
  `order_id` varchar(255),
  `service_order_id` varchar(255),
  `product_id` varchar(255),
  `booking_id` varchar(255),
  `grouping` varchar(255),
  `scanned` int NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `Creation` (
  `identifier` varchar(255) UNIQUE PRIMARY KEY,
  `service_order_id` varchar(255),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `UserTravel` (
  `user_id` int,
  `travel_id` int
);

CREATE TABLE `UploadFail` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `identifier` varchar(255),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `StatusChange` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `identifier` varchar(255),
  `previous_status` int,
  `new_status` int,
  `previous_confirmed_status` int,
  `new_confirmed_status` int,
  `info` varchar(255),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

ALTER TABLE `Product` ADD FOREIGN KEY (`order_id`) REFERENCES `Order` (`id`);

ALTER TABLE `Buyer` ADD FOREIGN KEY (`order_id`) REFERENCES `Order` (`id`);

ALTER TABLE `Receiver` ADD FOREIGN KEY (`order_id`) REFERENCES `Order` (`id`);

ALTER TABLE `Dropoff` ADD FOREIGN KEY (`order_id`) REFERENCES `Order` (`id`);

ALTER TABLE `Pickup` ADD FOREIGN KEY (`order_id`) REFERENCES `Order` (`id`);

ALTER TABLE `Order` ADD FOREIGN KEY (`location_id`) REFERENCES `Location` (`id`);

ALTER TABLE `Location` ADD FOREIGN KEY (`contract_id`) REFERENCES `Contract` (`id`);

ALTER TABLE `UserTravel` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`id`);

ALTER TABLE `UserTravel` ADD FOREIGN KEY (`travel_id`) REFERENCES `Travel` (`id`);

CREATE INDEX `Product_index_0` ON `Product` (`order_id`);

CREATE INDEX `Product_index_1` ON `Product` (`guide_number`);

CREATE INDEX `Buyer_index_2` ON `Buyer` (`order_id`);

CREATE INDEX `Receiver_index_3` ON `Receiver` (`order_id`);

CREATE INDEX `Dropoff_index_4` ON `Dropoff` (`order_id`);

CREATE INDEX `Pickup_index_5` ON `Pickup` (`order_id`);

CREATE INDEX `User_index_6` ON `User` (`cognito_id`);

ALTER TABLE `Order` COMMENT = "Main order information";
