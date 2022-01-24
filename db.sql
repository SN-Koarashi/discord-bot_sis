SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `discord` (
  `id` int(11) NOT NULL,
  `dis_id` char(18) NOT NULL,
  `day` int(11) NOT NULL,
  `date` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `discord`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `discord`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
