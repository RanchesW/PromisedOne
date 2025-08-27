# MongoDB Installation Script for Windows
# Run this script as Administrator

Write-Host "🍃 Installing MongoDB Community Edition..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Download URL for MongoDB 7.0 Community Edition
$mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi"
$tempPath = "$env:TEMP\mongodb-installer.msi"

try {
    Write-Host "📥 Downloading MongoDB installer..." -ForegroundColor Blue
    Invoke-WebRequest -Uri $mongoUrl -OutFile $tempPath
    
    Write-Host "🚀 Installing MongoDB..." -ForegroundColor Blue
    Start-Process msiexec.exe -Wait -ArgumentList "/i $tempPath /qn"
    
    Write-Host "📁 Creating data directory..." -ForegroundColor Blue
    New-Item -ItemType Directory -Force -Path "C:\data\db"
    
    Write-Host "🔧 Adding MongoDB to PATH..." -ForegroundColor Blue
    $mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin"
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    if ($currentPath -notlike "*$mongoPath*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$mongoPath", "Machine")
    }
    
    Write-Host "✅ MongoDB installation completed!" -ForegroundColor Green
    Write-Host "🚀 To start MongoDB, run: mongod" -ForegroundColor Cyan
    Write-Host "🔌 To connect, run: mongosh" -ForegroundColor Cyan
    
    # Clean up
    Remove-Item $tempPath -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try installing manually from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

Write-Host "`n📋 Alternative options:" -ForegroundColor Yellow
Write-Host "1. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor White
Write-Host "2. Install Docker and run: docker run -p 27017:27017 mongo:latest" -ForegroundColor White
Write-Host "3. Use the built-in JSON file storage for development" -ForegroundColor White
