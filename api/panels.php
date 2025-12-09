<?php
// CORS Headers
require "./header.php";

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

$sql = "SELECT
      i.qr_code as panel_id,
      i.panel_ref AS description,
      u.shortchar01 as epicor_asm_part_no,
      u.key1 as job_id,
      i.created_at AS label_creation_date,
      i.project_category as project,
      CASE WHEN ir.panel_serial IS NOT NULL THEN 1 ELSE 0 END as final,
      CASE WHEN lp.part_id IS NOT NULL THEN 1 ELSE 0 END as wrapped,
      pi.package_code as package,
      c.code as container,
      -- i.epicor_asm_part_no,
      -- pl.plan_added_date AS execution_date,
      -- lp.date as wrapped_date,
      -- pi.created_at as packed_at,
      -- ci.created_at as shipped_at,
      -- Additional fields for report
      -- i.project_code,
      -- i.epicor_part_no,
      -- pl.job_id,
      -- ir.worker_name as qc_worker,
       ir.datetime_out as qc_datetime
      				FROM 
                        label_app.kla_factory_epicor i 
                    LEFT JOIN 
                        mes.plans pl ON pl.panel_serial = i.qr_code
                    left join 
                    	label_app.ud31 u  on u.key5 = i.qr_code 
                    LEFT JOIN (
                        SELECT DISTINCT ir1.panel_serial, ir1.worker_name, ir1.datetime_out
                        FROM quality.inspection_results ir1 
                        WHERE ir1.gate  = 6 AND ir1.inspection_result = 'OK'
                    ) ir ON ir.panel_serial = i.qr_code
                    LEFT JOIN (
                        SELECT DISTINCT part_id, MIN(date) as date
                        FROM mes.log_printed
                        WHERE print_type = 'wrapping'
                        GROUP BY part_id
                    ) lp ON lp.part_id = i.qr_code
                    LEFT JOIN 
                        mes.package_items pi ON pi.part_id = i.qr_code
                    LEFT JOIN 
                        mes.packages pk ON pk.id = pi.package_id
                    LEFT JOIN 
                        mes.container_items ci ON ci.item_id = pk.code
                    LEFT JOIN 
                        mes.containers c ON c.id = ci.container_id
                        WHERE i.qr_code IS NOT null";

// Apply date filter
switch ($filter) {
    case "today":
        $sql .= " AND DATE(i.created_at) = CURDATE()";
        break;
    case "last30days":
        $sql .= " AND DATE(i.created_at) = CURDATE() - INTERVAL 1 DAY";
        break;
    case "last7days":
        $sql .= " AND DATE(i.created_at) >= CURDATE() - INTERVAL 7 DAY";
        break;
    case "last90days":
        $sql .= " AND DATE(i.created_at) >= CURDATE() - INTERVAL 90 DAY";
        break;
    case "1year":
        $sql .= " AND DATE(i.created_at) >= CURDATE() - INTERVAL 1 YEAR";
        break;
    case "2years":
        $sql .= " AND DATE(i.created_at) >= CURDATE() - INTERVAL 2 YEAR";
        break;
    case "3years":
        $sql .= " AND DATE(i.created_at) >= CURDATE() - INTERVAL 3 YEAR";
    case "5years":
        $sql .= " AND DATE(i.created_at) >= CURDATE() - INTERVAL 5 YEAR";
        break;
    // case "all":
    //     // No date filter
    //     break;
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
