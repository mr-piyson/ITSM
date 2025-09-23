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
    project,
    MAX(datetime_out) AS latest_out,
    GROUP_CONCAT(gate_name ORDER BY datetime_out SEPARATOR ',') AS route
FROM (
    SELECT 
        ir.panel_serial,
        ir.project,
        ir.datetime_out,
        CASE 
            WHEN gate = 1  THEN 'Mold'
            WHEN gate = 2  THEN 'Gelcoating'
            WHEN gate = 3  THEN 'Trimming'
            WHEN gate = 4  THEN 'Finishing'
            WHEN gate = 5  THEN 'Painting'
            WHEN gate = 6  THEN 'Final'
            WHEN gate = 10 THEN 'Demolding'
            WHEN gate = 11 THEN 'Drilling'
            WHEN gate = 12 THEN 'Bonding'
            WHEN gate = 15 THEN 'Paint Prep'
            WHEN gate = 16 THEN 'Wrapping'
            WHEN gate = 17 THEN 'Packing'
            WHEN gate = 18 THEN 'Mixing'
            WHEN gate = 19 THEN 'Casting'
            WHEN gate = 20 THEN 'Pullout Test'
            WHEN gate = 21 THEN 'Curing'
            WHEN gate = 22 THEN 'After Trimming'
        END AS gate_name
    FROM quality.inspection_results ir
    WHERE inspection_result = 'OK'
) t
";

// Apply date filter
$params = [];
switch ($filter) {
    case "today":
        $sql .= " WHERE DATE(datetime_out) = :today";
        $params[':today'] = date('Y-m-d');
        break;
    case "last30days":
        $sql .= " WHERE DATE(datetime_out) >= :last30days";
        $params[':last30days'] = date('Y-m-d', strtotime('-30 days'));
        break;
    case "last7days":
        $sql .= " WHERE DATE(datetime_out) >= :last7days";
        $params[':last7days'] = date('Y-m-d', strtotime('-7 days'));
        break;
    case "last90days":
        $sql .= " WHERE DATE(datetime_out) >= :last90days";
        $params[':last90days'] = date('Y-m-d', strtotime('-90 days'));
        break;
    case "1year":
        $sql .= " WHERE DATE(datetime_out) >= :oneyear";
        $params[':oneyear'] = date('Y-m-d', strtotime('-1 year'));
        break;
    case "2years":
        $sql .= " WHERE DATE(datetime_out) >= :twoyears";
        $params[':twoyears'] = date('Y-m-d', strtotime('-2 years'));
        break;
    case "3years":
        $sql .= " WHERE DATE(datetime_out) >= :threeyears";
        $params[':threeyears'] = date('Y-m-d', strtotime('-3 years'));
        break;
    case "all":
        $sql .= ""; // No date filter
        break;
    default:
        $filter = null; // Invalid filter
        break;
}

$sql .= " GROUP BY panel_serial";

if (!$filter) {
    echo json_encode([]);
} else {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $result = $stmt->fetchAll();
    echo json_encode($result);
}

exit;
