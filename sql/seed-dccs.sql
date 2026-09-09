-- Seed data for the 32 DCC Raspberry Pi devices (from DCCs.csv).
-- Run AFTER dccs.sql. This inserts all rows; re-running is safe because
-- dcc_code is unique (duplicates are skipped via INSERT IGNORE).

INSERT IGNORE INTO dccs
	(name, ip_address, card_reader_id, dcc_code, card_reader_ip, screen_inch,
	 toggles, scanner, card_reader, paper_printer, rfid_label_printer, light_tower,
	 check_interval_seconds, inActive, `user`)
VALUES
	('Mold Staging', '172.18.6.33', 1, 'DCC001', '172.18.6.1', '15 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Mold Preparation', '172.18.6.34', 2, 'DCC002', '172.18.6.2', '27 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Gelcoat Curing', '172.18.6.35', 3, 'DCC003', '172.18.6.3', '32 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Closed Molding Laminate Cure- VI', '172.18.6.36', 4, 'DCC004', '172.18.6.4', '32 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Demolding- Closed Molding', '172.18.6.37', 5, 'DCC005', '172.18.6.5', '24 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Hand Lamination', '172.18.6.38', 6, 'DCC006', '172.18.6.6', '32 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Hand Lamination', '172.18.6.39', 7, 'DCC007', '172.18.6.7', '33 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Hand Lamination- Laminate Curing', '172.18.6.40', 8, 'DCC008', '172.18.6.8', '32 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Demolding- Open Molding', '172.18.6.41', 9, 'DCC009', '172.18.6.9', '24 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Trimming', '172.18.6.42', 10, 'DCC010', '172.18.6.10', '15 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Drilling', '172.18.6.43', 11, 'DCC011', '172.18.6.11', '24 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Super Market After demolding', '172.18.6.44', 12, 'DCC012', '172.18.6.12', '42 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('In-Mold Bonding', '172.18.6.45', 13, 'DCC013', '172.18.6.13', '27 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Bonding', '172.18.6.46', 14, 'DCC014', '172.18.6.14', '27 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Over Lamination', '172.18.6.47', 15, 'DCC015', '172.18.6.15', '27 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Paint Preparation', '172.18.6.48', 16, 'DCC016', '172.18.6.16', '27 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Super Market before primer', '172.18.6.49', 17, 'DCC017', '172.18.6.17', '42 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Primer Oven Curing', '172.18.6.50', 18, 'DCC018', '172.18.6.18', '27 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Super Market before painting', '172.18.6.51', 19, 'DCC019', '172.18.6.19', '42 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Paint Curing Inside the Booth', '172.18.6.52', 20, 'DCC020', '172.18.6.20', '27 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Super Market before final assembly', '172.18.6.53', 21, 'DCC021', '172.18.6.21', '42 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Finished Goods', '172.18.6.54', 22, 'DCC022', '172.18.6.22', '42 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Gelcoating', '172.18.6.55', 23, 'DCC023', '172.18.6.23', '32 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Vacuum Infusion- Consumable- Fiber Loading', '172.18.6.56', 24, 'DCC024', '172.18.6.24', '15 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Vacuum Infusion- Consumable- Laying', '172.18.6.57', 25, 'DCC025', '172.18.6.25', '15 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Vacuum Infusion- Consumable- Leak Test +Infusion', '172.18.6.58', 26, 'DCC026', '172.18.6.26', '15 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Primer Booth', '172.18.6.59', 27, 'DCC027', '172.18.6.27', '27 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Painting Booth (Includes Flash Off)', '172.18.6.60', 28, 'DCC028', '172.18.6.28', '27 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Paint Buffing', '172.18.6.61', 29, 'DCC029', '172.18.6.29', '24 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Paint Buffing', '172.18.6.62', 30, 'DCC030', '172.18.6.30', '24 inch', 1, 1, 1, 0, 0, 0, 300, 0, 0),
	('Final Assembly (FA)', '172.18.6.63', 31, 'DCC031', '172.18.6.31', '32 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0),
	('Final Assembly (FA)', '172.18.6.64', 32, 'DCC032', '172.18.6.32', '32 inch', 0, 1, 1, 0, 0, 0, 300, 0, 0);
