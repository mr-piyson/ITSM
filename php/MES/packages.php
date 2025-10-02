<?php
// CORS Headers
require "../header.php";

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
    p.id,
    p.code,
    p.project_name,
    p.length_cm,
    p.width_cm, 
    p.height_cm,
    p.weight_kg,
    p.created_at
FROM mes.packages p ";

// Apply date filter
$params = [];
switch ($filter) {
    case "today":
        $sql .= " WHERE DATE(p.created_at) = :today";
        $params[':today'] = date('Y-m-d');
        break;
    case "last30days":
        $sql .= " WHERE DATE(p.created_at) >= :last30days";
        $params[':last30days'] = date('Y-m-d', strtotime('-30 days'));
        break;
    case "last7days":
        $sql .= " WHERE DATE(p.created_at) >= :last7days";
        $params[':last7days'] = date('Y-m-d', strtotime('-7 days'));
        break;
    case "last90days":
        $sql .= " WHERE DATE(p.created_at) >= :last90days";
        $params[':last90days'] = date('Y-m-d', strtotime('-90 days'));
        break;
    case "1year":
        $sql .= " WHERE DATE(p.created_at) >= :oneyear";
        $params[':oneyear'] = date('Y-m-d', strtotime('-1 year'));
        break;
    case "2years":
        $sql .= " WHERE DATE(p.created_at) >= :twoyears";
        $params[':twoyears'] = date('Y-m-d', strtotime('-2 years'));
        break;
    case "3years":
        $sql .= " WHERE DATE(p.created_at) >= :threeyears";
        $params[':threeyears'] = date('Y-m-d', strtotime('-3 years'));
        break;
    case "all":
        $sql .= ""; // No date filter
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
