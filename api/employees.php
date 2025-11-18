<?php
// CORS Headers
require "./header.php";

// NOTE: Assumes $host, $db, $charset, $user, $pass are defined in header.php

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$id = isset($_GET['id']) ? trim($_GET['id']) : null;

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Step 1: Get all employees (or single employee if code is provided)
// If no code is specified, return only specific fields
$sql_employees = !empty($id)
    ? "SELECT * FROM mes.employees e WHERE e.id = :id"
    : "SELECT e.id,
     e.emp_code,
     e.name ,
     e.access,
     e.department,
     e.designation,
     e.email 
     FROM mes.employees e";

$stmt = $pdo->prepare($sql_employees);
if (!empty($id)) {
    $stmt->bindValue(':id', $id, PDO::PARAM_STR);
}
$stmt->execute();
$employees = $stmt->fetchAll();

// If no employees found, return early
if (empty($employees)) {
    http_response_code(200);
    echo json_encode([]);
    exit;
}

// Step 2: Get employee UIDs for filtering resources
$employee_uids = array_column($employees, 'id');
$placeholders = str_repeat('?,', count($employee_uids) - 1) . '?';

// Step 3: Get latest employee photos (model = 'employee') in one query
$sql_photos = "
SELECT 
    r1.uid,
    r1.filename,
    r1.ext,
    r1.folder
FROM 
    mes.resources r1
LEFT JOIN 
    mes.resources r2 ON r1.uid = r2.uid 
        AND r1.model = 'employee' 
        AND r2.model = 'employee'
        AND r2.id > r1.id
WHERE 
    r1.model = 'employee'
    AND r1.uid IN ($placeholders)
    AND r2.id IS NULL
";

$stmt_photos = $pdo->prepare($sql_photos);
$stmt_photos->execute($employee_uids);
$photos = $stmt_photos->fetchAll();

// Index photos by uid for fast lookup
$photos_map = [];
foreach ($photos as $photo) {
    $photos_map[$photo['uid']] = $photo;
}

// Step 4: Get fallback folders (any non-null folder for each uid)
$sql_folders = "
SELECT 
    r.uid,
    r.folder
FROM 
    mes.resources r
WHERE 
    r.uid IN ($placeholders)
    AND r.folder IS NOT NULL
GROUP BY 
    r.uid
";

$stmt_folders = $pdo->prepare($sql_folders);
$stmt_folders->execute($employee_uids);
$folders = $stmt_folders->fetchAll();

// Index folders by uid for fast lookup
$folders_map = [];
foreach ($folders as $folder_row) {
    if (!isset($folders_map[$folder_row['uid']])) {
        $folders_map[$folder_row['uid']] = $folder_row['folder'];
    }
}

// Step 5: Merge data in PHP
$final_result = [];
foreach ($employees as $employee) {
    $uid = $employee['id'];
    $employee['photo'] = null;

    // Check if we have photo data for this employee
    if (isset($photos_map[$uid])) {
        $photo_data = $photos_map[$uid];

        // Determine folder: use photo's folder, or fallback to any available folder
        $folder = !empty($photo_data['folder'])
            ? $photo_data['folder']
            : ($folders_map[$uid] ?? null);

        // Build photo path if all components exist
        if (!empty($folder) && !empty($photo_data['filename']) && !empty($photo_data['ext'])) {
            $employee['photo'] = $folder . '/' . $photo_data['filename'] . '.' . $photo_data['ext'];
        }
    }

    $final_result[] = $employee;
}

http_response_code(200);
echo json_encode($final_result);
exit;
