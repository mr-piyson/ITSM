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

$filter = $_GET['filter'] ?? null;

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
    panel_serial,
    datetime_out,
    gate
from quality.inspection_results
where inspection_result = 'OK'
";

// Apply date filter
$params = [];
switch ($filter) {
    case "today":
        $sql .= " AND DATE(datetime_out) = :today";
        $params[':today'] = date('Y-m-d');
        break;
    case "last30days":
        $sql .= " AND DATE(datetime_out) >= :last30days";
        $params[':last30days'] = date('Y-m-d', strtotime('-30 days'));
        break;
    case "last7days":
        $sql .= " AND DATE(datetime_out) >= :last7days";
        $params[':last7days'] = date('Y-m-d', strtotime('-7 days'));
        break;
    case "last90days":
        $sql .= " AND DATE(datetime_out) >= :last90days";
        $params[':last90days'] = date('Y-m-d', strtotime('-90 days'));
        break;
    case "1year":
        $sql .= " AND DATE(datetime_out) >= :oneyear";
        $params[':oneyear'] = date('Y-m-d', strtotime('-1 year'));
        break;
    case "2years":
        $sql .= " AND DATE(datetime_out) >= :twoyears";
        $params[':twoyears'] = date('Y-m-d', strtotime('-2 years'));
        break;
    case "3years":
        $sql .= " AND DATE(datetime_out) >= :threeyears";
        $params[':threeyears'] = date('Y-m-d', strtotime('-3 years'));
        break;
    default:
        $filter = null; // Invalid filter
        break;
}

if (!$filter) {
    echo json_encode([]);
} else {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $result = $stmt->fetchAll();
    echo json_encode($result);
}

exit;
