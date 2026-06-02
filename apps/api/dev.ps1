#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Anicca API — Developer start script for Windows PowerShell.

.DESCRIPTION
    Activates the Python virtual environment, runs Alembic migrations,
    and starts the FastAPI development server on port 8000.

.NOTES
    Author:    Evelin Brandão Cordeiro
    Copyright: 2026 Anicca. All rights reserved.
    License:   MIT

.EXAMPLE
    .\dev.ps1
#>

$ErrorActionPreference = "Stop"
$ApiDir = $PSScriptRoot

$VenvActivate = Join-Path $ApiDir ".venv\Scripts\Activate.ps1"
$Uvicorn     = Join-Path $ApiDir ".venv\Scripts\uvicorn.exe"
$Alembic     = Join-Path $ApiDir ".venv\Scripts\alembic.exe"

if (-not (Test-Path $VenvActivate)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv (Join-Path $ApiDir ".venv")
    & (Join-Path $ApiDir ".venv\Scripts\pip.exe") install --upgrade pip --quiet
    & (Join-Path $ApiDir ".venv\Scripts\pip.exe") install -r (Join-Path $ApiDir "requirements.txt")
}

& $VenvActivate

Write-Host "Running Alembic migrations..." -ForegroundColor Cyan
Set-Location $ApiDir
& $Alembic upgrade head

Write-Host "Starting Anicca API on http://localhost:8000 ..." -ForegroundColor Green
Write-Host "   Docs: http://localhost:8000/docs" -ForegroundColor DarkGray
& $Uvicorn main:app --reload --port 8000 --host 0.0.0.0
