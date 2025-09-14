<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Database connection
$host = '172.18.1.20';
$db   = 'mes';
$user = 'root';
$pass = 'bfgA$$essDb';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$filter = isset($_GET['filter']) ? $_GET['filter'] : null;

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get 'from' and 'to' from query params, with defaults
function validate_date($date, $default)
{
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return ($d && $d->format('Y-m-d') === $date) ? $date : $default;
}

$sql = "SELECT 
panel_serial ,
project ,
datetime_out ,
inspection_result  ,
case when gate = 10 then 'Demolding' end as gate
from quality.inspection_results i 
where gate = 10 and inspection_result = 'OK'";

// Apply date filter
switch ($filter) {
    case "today":
        $sql .= " AND DATE(i.datetime_out) = CURDATE()";
        break;
    case "last30days":
        $sql .= " AND DATE(i.datetime_out) = CURDATE() - INTERVAL 1 DAY";
        break;
    case "last7days":
        $sql .= " AND DATE(i.datetime_out) >= CURDATE() - INTERVAL 7 DAY";
        break;
    case "last90days":
        $sql .= " AND DATE(i.datetime_out) >= CURDATE() - INTERVAL 90 DAY";
        break;
    case "1year":
        $sql .= " AND DATE(i.datetime_out) >= CURDATE() - INTERVAL 1 YEAR";
        break;
    case "2years":
        $sql .= " AND DATE(i.datetime_out) >= CURDATE() - INTERVAL 2 YEAR";
        break;
    case "3years":
        $sql .= " AND DATE(i.datetime_out) >= CURDATE() - INTERVAL 3 YEAR";
        break;
    case "all":
        // No date filter
        break;
    default:
        $filter = null; // Invalid filter, no results
        break;
}


if (!$filter) {
    echo json_encode([]);
} else {
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll();
    echo json_encode($result);
}

exit;
