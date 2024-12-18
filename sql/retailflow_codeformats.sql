-- MySQL dump 10.13  Distrib 8.0.38, for macos14 (x86_64)
--
-- Host: localhost    Database: retailflow
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `codeformats`
--

DROP TABLE IF EXISTS `codeformats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codeformats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Type` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `PreFix` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `length` int NOT NULL,
  `Sample` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nextValue` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codeformats`
--

LOCK TABLES `codeformats` WRITE;
/*!40000 ALTER TABLE `codeformats` DISABLE KEYS */;
INSERT INTO `codeformats` VALUES (1,'1','Product Code','PRD',5,'PRD0001',22),(2,'2','Supplier Code','SP',5,'SP0001',97),(3,'3','Purchase Order Code','PO',5,'PO0001',1),(4,'4','Invoice Code','INV',5,'INV000001',1),(5,'5','Customer Code','CST',5,'CST0001',7);
/*!40000 ALTER TABLE `codeformats` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-16 17:24:06
