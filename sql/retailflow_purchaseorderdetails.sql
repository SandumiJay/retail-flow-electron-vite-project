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
-- Table structure for table `purchaseorderdetails`
--

DROP TABLE IF EXISTS `purchaseorderdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchaseorderdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `poCode` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `ProductCode` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `ProductName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `qty` int NOT NULL,
  `cost` decimal(65,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseorderdetails`
--

LOCK TABLES `purchaseorderdetails` WRITE;
/*!40000 ALTER TABLE `purchaseorderdetails` DISABLE KEYS */;
INSERT INTO `purchaseorderdetails` VALUES (1,'SX00023','PRD00004','Grapes2',1,1.00),(2,'SX00023','PRD00004','Grapes2',11,11.00),(3,'SX00023','','',1,1.22),(4,'SX00024','PRD00004','Grapes2',1,11.00),(5,'SX00024','','',1,0.00),(6,'SX00024','','',1,0.00),(7,'SX00024','','',1,0.00),(8,'SX00025','SX00014','qwqwq',1,1.00),(9,'SX00026','PRD00004','Grapes2',1,1.00),(10,'SX00026','PRD00004','Grapes2',1,1.00),(11,'SX00028','SX00014','qwqwq',12,1.00),(12,'SX00028','','',1,0.00),(13,'SX00028','','',1,0.00),(14,'SX00028','','',1,0.00),(15,'SX00028','','',1,0.00),(32,'SPX00037','PRD00005','Dog Vacciene ',30,1050.00),(33,'SPX00037','PRD00004','Grapes2',100,4.00),(34,'SPX00037','PRD00005','Dog Vacciene ',4,60.00),(35,'SPX00038','PRD00004','Grapes2',3,4.00),(36,'SPX00038','PRD00005','Dog Vacciene ',4,6.00),(37,'SPX00039','SX00014','qwqwq',9,9.00),(38,'SPX00039','PRD00004','Grapes2',6,8.00),(39,'SPX00040','SX00014','qwqwq',9,9.00),(40,'SPX00040','PRD00004','Grapes2',6,8.00),(41,'SPX00041','SX00014','qwqwq',9,9.00),(42,'SPX00041','PRD00004','Grapes2',6,8.00),(47,'SPX00045','PRD00004','Grapes2',4,5.00),(48,'SPX00045','PRD00005','Dog Vacciene ',6,7.00),(82,'SPX00064','SX00014','qwqwq',4,6.00),(83,'SPX00064','PRD00004','Grapes2',5,8.00),(84,'SPX00064','PRD00004','Grapes2',5,10.00);
/*!40000 ALTER TABLE `purchaseorderdetails` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-21  2:23:29
