# ============================================
# Hotel Reservation System - Automated Setup
# ============================================
# This script automates the MySQL database setup process

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hotel Reservation System - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
Write-Host "🔍 Checking MySQL installation..." -ForegroundColor Yellow

$mysqlPath = $null
$possiblePaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $mysqlPath = $path
        break
    }
}

if (-not $mysqlPath) {
    # Try to find mysql in PATH
    try {
        $mysqlPath = (Get-Command mysql -ErrorAction Stop).Source
    } catch {
        Write-Host "❌ MySQL not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install MySQL 8.0 or higher from:" -ForegroundColor Yellow
        Write-Host "https://dev.mysql.com/downloads/installer/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "After installing MySQL, run this script again." -ForegroundColor Yellow
        Write-Host ""
        pause
        exit 1
    }
}

Write-Host "✅ MySQL found at: $mysqlPath" -ForegroundColor Green
Write-Host ""

# Get MySQL root password
Write-Host "Please enter your MySQL root password:" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""
Write-Host "🔧 Setting up hotel_reservation database..." -ForegroundColor Yellow

# Get the directory where the script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "setup-database.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Error: setup-database.sql not found!" -ForegroundColor Red
    Write-Host "Expected location: $sqlFile" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Run the SQL setup script
try {
    $process = Start-Process -FilePath $mysqlPath `
        -ArgumentList "-u", "root", "-p$plainPassword", "-e", "source $sqlFile" `
        -NoNewWindow -Wait -PassThru -RedirectStandardError "error.log"
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ Database setup complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  🎉 Setup Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Login Credentials:" -ForegroundColor Cyan
        Write-Host "  📧 Email:    admin@hotel.com" -ForegroundColor White
        Write-Host "  🔑 Password: admin123" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Change the password after first login!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "You can now run 'Hotel Reservation Admin.exe'" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Error during database setup!" -ForegroundColor Red
        if (Test-Path "error.log") {
            Write-Host ""
            Write-Host "Error details:" -ForegroundColor Yellow
            Get-Content "error.log"
        }
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  • Incorrect MySQL password" -ForegroundColor White
        Write-Host "  • MySQL service not running" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "❌ Failed to run MySQL setup!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Cleanup
if (Test-Path "error.log") {
    Remove-Item "error.log" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

