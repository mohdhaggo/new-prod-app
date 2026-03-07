<?php
// Root index file - routes to frontend or backend API

$requestUri = $_SERVER['REQUEST_URI'];

// API requests go to backend
if (strpos($requestUri, '/backend/api') === 0 || strpos($requestUri, '/api') === 0) {
    require_once __DIR__ . '/backend/api/index.php';
    exit;
}

// Frontend requests
$path = parse_url($requestUri, PHP_URL_PATH);

// Default to login page
if ($path === '/' || $path === '/index.php') {
    header('Location: /frontend/login.html');
    exit;
}

// Serve static files from frontend
$filePath = __DIR__ . $path;
if (file_exists($filePath) && is_file($filePath)) {
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    
    $mimeTypes = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
    ];
    
    if (isset($mimeTypes[$extension])) {
        header('Content-Type: ' . $mimeTypes[$extension]);
    }
    
    readfile($filePath);
    exit;
}

// 404
http_response_code(404);
echo '404 - Page Not Found';
