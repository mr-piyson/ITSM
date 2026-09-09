-- Schema migration for DCC devices and connectivity monitoring.
-- Run against the ITSM (ISS) MySQL database.

CREATE TABLE IF NOT EXISTS dccs (
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	ip_address VARCHAR(50) DEFAULT NULL,
	card_reader_id INT DEFAULT NULL,
	dcc_code VARCHAR(20) DEFAULT NULL,
	card_reader_ip VARCHAR(50) DEFAULT NULL,
	screen_inch VARCHAR(20) DEFAULT NULL,
	toggles TINYINT(1) NOT NULL DEFAULT 0,
	scanner TINYINT(1) NOT NULL DEFAULT 0,
	card_reader TINYINT(1) NOT NULL DEFAULT 0,
	paper_printer TINYINT(1) NOT NULL DEFAULT 0,
	rfid_label_printer TINYINT(1) NOT NULL DEFAULT 0,
	light_tower TINYINT(1) NOT NULL DEFAULT 0,
	check_interval_seconds INT NOT NULL DEFAULT 300,
	last_checked_at DATETIME DEFAULT NULL,
	last_status VARCHAR(20) DEFAULT NULL,
	inActive TINYINT(1) NOT NULL DEFAULT 0,
	\`user\` INT DEFAULT 0,
	PRIMARY KEY (id),
	UNIQUE KEY uq_dccs_code (dcc_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

created with a `ws_reachable` / `ping_latency_ms` pair, run the migration below once to
upgrade existing tables to the new dual-device schema.
*/

-- Upgrade an already-created dcc_connectivity_logs to the dual-device schema.
-- (Safely no-ops if the new columns already exist.)
SET @sql = IF(
	(SELECT COUNT(*) FROM information_schema.COLUMNS
	  WHERE TABLE_SCHEMA = DATABASE()
	    AND TABLE_NAME = 'dcc_connectivity_logs'
	    AND COLUMN_NAME = 'dcc_ping_latency_ms') = 0,
	'ALTER TABLE dcc_connectivity_logs
		ADD COLUMN dcc_reachable TINYINT(1) NOT NULL DEFAULT 0 AFTER status,
		ADD COLUMN dcc_ping_latency_ms INT DEFAULT NULL AFTER dcc_reachable,
		ADD COLUMN reader_reachable TINYINT(1) NOT NULL DEFAULT 0 AFTER dcc_ping_latency_ms,
		ADD COLUMN reader_ping_latency_ms INT DEFAULT NULL AFTER reader_reachable',
	'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- Migrate existing rows: ping_latency_ms -> reader (historical latency was the reader WS check).
UPDATE dcc_connectivity_logs
SET reader_reachable = ws_reachable,
	reader_ping_latency_ms = ping_latency_ms,
	dcc_reachable = 1
WHERE ws_reachable IS NOT NULL;
ALTER TABLE dcc_connectivity_logs
	DROP COLUMN ws_reachable,
	DROP COLUMN ping_latency_ms;

CREATE TABLE IF NOT EXISTS dcc_connectivity_logs (
	id INT NOT NULL AUTO_INCREMENT,
	dcc_id INT NOT NULL,
	status VARCHAR(20) NOT NULL,
	dcc_reachable TINYINT(1) NOT NULL DEFAULT 0,
	dcc_ping_latency_ms INT DEFAULT NULL,
	reader_reachable TINYINT(1) NOT NULL DEFAULT 0,
	reader_ping_latency_ms INT DEFAULT NULL,
	checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	\`user\` INT DEFAULT 0,
	PRIMARY KEY (id),
	KEY idx_dcc_logs_dcc (dcc_id),
	KEY idx_dcc_logs_checked (checked_at),
	CONSTRAINT fk_dcc_logs_dcc FOREIGN KEY (dcc_id) REFERENCES dccs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
