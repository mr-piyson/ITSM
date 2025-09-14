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

$sql = "
SELECT 
    p.id,
    p.code,
    p.project_name,
    p.length_cm,
    p.width_cm, 
    p.height_cm,
    p.weight_kg,
    p.created_at,
    CASE 
        WHEN s.id IS NOT NULL THEN 1
        ELSE 0
    END AS has_photo
FROM mes.packages p
LEFT JOIN mes.resources s
    ON s.model = 'package' AND s.type = 'image' AND s.uid = p.id 
where
    
";

// Apply date filter
switch ($filter) {
    case "today":
        $sql .= " DATE(p.created_at) = CURDATE()";
        break;
    case "last30days":
        $sql .= " DATE(p.created_at) = CURDATE() - INTERVAL 1 DAY";
        break;
    case "last7days":
        $sql .= " DATE(p.created_at) >= CURDATE() - INTERVAL 7 DAY";
        break;
    case "last90days":
        $sql .= " DATE(p.created_at) >= CURDATE() - INTERVAL 90 DAY";
        break;
    case "1year":
        $sql .= " DATE(p.created_at) >= CURDATE() - INTERVAL 1 YEAR";
        break;
    case "2years":
        $sql .= " DATE(p.created_at) >= CURDATE() - INTERVAL 2 YEAR";
        break;
    case "3years":
        $sql .= " DATE(p.created_at) >= CURDATE() - INTERVAL 3 YEAR";
        break;
    case "all":
        // No date filter
        break;
    default:
        $filter = null; // Invalid filter, no results
        break;
}

$sql .= " order by p.created_at desc ;";

if (!$filter) {
    echo json_encode([]);
} else {
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll();
    echo json_encode($result);
}

exit;
