<?php
// CORS Headers
require "../header.php";

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$year = isset($_GET['year']) ? intval($_GET['year']) : null;
$month = isset($_GET['month']) ? intval($_GET['month']) : null;

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Validate year and month early
if (!$year || !$month || !checkdate($month, 1, $year)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid date range']);
    exit;
}

// Format month with leading zero
$monthFormatted = str_pad($month, 2, '0', STR_PAD_LEFT);
$yearMonth = "$year-$monthFormatted";

$sql = "SELECT DISTINCT
    pk.code as box_code,
    i.project_category as project,
    i.qr_code as part_id,
    i.panel_ref AS description,
    c.code as container_id,
    ci.created_at as date,
    c.shipped_by,
    u.key1 as job_id,
    u.shortchar01 as epicor_asm_part_no,
    u.shortchar01 as epicor_part_no
FROM 
    mes.container_items ci
INNER JOIN 
    mes.containers c ON c.id = ci.container_id
INNER JOIN 
    mes.packages pk ON pk.code = ci.item_id
INNER JOIN 
    mes.package_items pi ON pi.package_id = pk.id
INNER JOIN 
    label_app.kla_factory_epicor i ON i.qr_code = pi.part_id
LEFT JOIN 
    label_app.ud31 u ON u.key5 = i.qr_code
WHERE 
    DATE_FORMAT(ci.created_at, '%Y-%m') = :yearMonth
    AND c.id IS NOT NULL 
ORDER BY i.project_category DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute(['yearMonth' => $yearMonth]);
$result = $stmt->fetchAll();
echo json_encode($result);

exit;
