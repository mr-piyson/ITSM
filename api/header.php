<?php

require_once __DIR__ . '../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


// Database connection
$host = $_ENV["DATABASE_HOST"];
$db   = $_ENV["MES_DATABASE"];
$user = $_ENV["DATABASE_USER_NAME"];
$pass = $_ENV["DATABASE_PASSWORD"];
$charset = "utf8mb4";
