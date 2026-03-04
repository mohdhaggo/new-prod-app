# Quick Start Script for Rodeo Drive CRM Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Rodeo Drive CRM - Backend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend")) {
    Write-Host "Error: backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check PHP installation
Write-Host "Checking PHP installation..." -ForegroundColor Yellow
try {
    $phpVersion = php -v 2>&1 | Select-Object -First 1
    Write-Host "[OK] PHP found: $phpVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] PHP not found in PATH!" -ForegroundColor Red
    Write-Host "Please install PHP or add it to your PATH." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend API Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor Yellow
Write-Host "  > http://localhost:8080/api" -ForegroundColor Green
Write-Host ""
Write-Host "Test pages:" -ForegroundColor Yellow
Write-Host "  > API Test: http://localhost:8080/frontend/test-api.html" -ForegroundColor Green
Write-Host "  > Login: http://localhost:8080/frontend/login.html" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory and start PHP server
Set-Location backend
php -S localhost:8080 router.php

# This will run until user stops with Ctrl+C
