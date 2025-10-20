# Claude Screenshot System - Simple Windows PowerShell Installer
# Simplified version for testing

#Requires -Version 5.1

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$Help
)

# Configuration
$Script:RepoUrl = "https://raw.githubusercontent.com/miyashita337/claude-screenshot/main"
$Script:InstallDir = "$env:USERPROFILE\Pictures\Screenshots"
$Script:ClaudeCommandsDir = "$env:USERPROFILE\.claude\commands"
$Script:ScriptsDir = "$Script:InstallDir\scripts"

# WSL Detection
$Script:IsWSL = $false
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    $Script:IsWSL = $true
    Write-LogInfo "WSL environment detected"
}

# Logging functions
function Write-LogInfo {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-LogError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Show help
function Show-Help {
    Write-Host "Claude Screenshot System - Windows PowerShell Installer

Usage: .\install_simple.ps1 [OPTIONS]

Options:
  -Force      Skip confirmation prompts
  -Help       Show this help message

This installer sets up a screenshot automation system for Windows
that integrates with Claude Code."
}

# Set PowerShell Execution Policy
function Set-ExecutionPolicyIfNeeded {
    Write-LogInfo "Checking PowerShell execution policy..."
    
    $currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
    if ($currentPolicy -eq "Restricted") {
        try {
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
            Write-LogSuccess "Set execution policy to RemoteSigned for current user"
        }
        catch {
            Write-LogError "Failed to set execution policy. You may need to run: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"
        }
    } else {
        Write-LogInfo "Execution policy is already set to: $currentPolicy"
    }
}

# Create directories
function New-InstallDirectories {
    Write-LogInfo "Creating installation directories..."
    
    $directories = @(
        $Script:InstallDir,
        $Script:ClaudeCommandsDir,
        $Script:ScriptsDir
    )
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-LogSuccess "Created directory: $dir"
        } else {
            Write-LogInfo "Directory already exists: $dir"
        }
    }
}

# Install PowerShell scripts
function Install-PowerShellScripts {
    Write-LogInfo "Installing PowerShell scripts..."
    
    # PowerShell scripts to download
    $scripts = @(
        @{
            Name = "screenshot_manager.ps1"
            Content = @"
# Windows Screenshot Manager for Claude
param(
    [Parameter(Mandatory=`$true)]
    [string]`$Action
)

`$ScreenshotDir = "`$env:USERPROFILE\Pictures\Screenshots"

function Start-Monitoring {
    Write-Host "Starting screenshot monitoring..."
    
    `$watcher = New-Object System.IO.FileSystemWatcher
    `$watcher.Path = `$ScreenshotDir
    `$watcher.Filter = "*.png"
    `$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName
    
    Register-ObjectEvent -InputObject `$watcher -EventName "Created" -Action {
        `$path = `$Event.SourceEventArgs.FullPath
        `$name = `$Event.SourceEventArgs.Name
        Write-Host "New screenshot detected: `$name"
    }
    
    Write-Host "Monitoring `$ScreenshotDir for new screenshots..."
    while (`$true) { Start-Sleep -Seconds 1 }
}

switch (`$Action) {
    "monitor" { Start-Monitoring }
    "list" { 
        Get-ChildItem -Path `$ScreenshotDir -Filter "*.png" | 
        Sort-Object -Property LastWriteTime -Descending |
        Select-Object -First 10 |
        ForEach-Object { Write-Output `$_.FullName }
    }
    "latest" {
        `$latest = Get-ChildItem -Path `$ScreenshotDir -Filter "*.png" | 
        Sort-Object -Property LastWriteTime -Descending |
        Select-Object -First 1
        if (`$latest) { Write-Output `$latest.FullName }
    }
}
"@
        },
        @{
            Name = "claude_integration.ps1"
            Content = @"
# Claude Integration for Windows
param(
    [string]`$Command = "latest"
)

`$ScreenshotDir = "`$env:USERPROFILE\Pictures\Screenshots"

function Get-LatestScreenshot {
    `$latest = Get-ChildItem -Path `$ScreenshotDir -Filter "*.png" | 
    Sort-Object -Property LastWriteTime -Descending |
    Select-Object -First 1
    
    if (`$latest) {
        # Return path with quotes to handle spaces
        Write-Output "`"`$(`$latest.FullName)`""
    }
}

function Get-ScreenshotList {
    Get-ChildItem -Path `$ScreenshotDir -Filter "*.png" | 
    Sort-Object -Property LastWriteTime -Descending |
    Select-Object -First 10 |
    ForEach-Object { 
        # Return each path with quotes to handle spaces
        Write-Output "`"`$(`$_.FullName)`""
    }
}

switch (`$Command) {
    "latest" { Get-LatestScreenshot }
    "list" { Get-ScreenshotList }
}
"@
        }
    )
    
    foreach ($script in $scripts) {
        try {
            $scriptPath = Join-Path $Script:ScriptsDir $script.Name
            $script.Content | Out-File -FilePath $scriptPath -Encoding UTF8
            Write-LogSuccess "Created: $($script.Name)"
        }
        catch {
            Write-LogError "Failed to create $($script.Name): $($_.Exception.Message)"
        }
    }
}

# Install Claude Code commands
function Install-ClaudeCommands {
    Write-LogInfo "Installing Claude Code custom commands..."
    
    # Create Windows-optimized Claude commands
    $commands = @(
        @{
            Name = "ss.md"
            Content = @"
---
input: optional
output: read-files
---

Get the latest screenshot from Windows Pictures folder.

Run the PowerShell command to get the latest screenshot:
``````powershell
& "`$env:USERPROFILE\Pictures\Screenshots\scripts\claude_integration.ps1" -Command latest
``````

Then read the screenshot file at the returned path.
"@
        },
        @{
            Name = "sslist.md"
            Content = @"
---
input: optional
output: list
---

List recent screenshots from Windows Pictures folder.

Run the PowerShell command to list recent screenshots:
``````powershell
& "`$env:USERPROFILE\Pictures\Screenshots\scripts\claude_integration.ps1" -Command list
``````

This returns a list of the 10 most recent screenshot file paths.
"@
        },
        @{
            Name = "ssshow.md"
            Content = @"
---
input: screenshot_number
output: read-files
---

Show a specific screenshot by number from the recent list.

First, run sslist to get the list of recent screenshots, then read the file at the specified index.
"@
        }
    )
    
    foreach ($command in $commands) {
        try {
            $commandPath = Join-Path $Script:ClaudeCommandsDir $command.Name
            $command.Content | Out-File -FilePath $commandPath -Encoding UTF8
            Write-LogSuccess "Created: $($command.Name)"
        }
        catch {
            Write-LogError "Failed to create $($command.Name): $($_.Exception.Message)"
        }
    }
}

# Setup PowerShell Profile aliases
function Setup-PowerShellProfile {
    Write-LogInfo "Setting up PowerShell profile aliases..."
    
    try {
        # Ensure PowerShell profile exists
        if (!(Test-Path $PROFILE)) {
            New-Item -ItemType File -Path $PROFILE -Force | Out-Null
            Write-LogSuccess "Created PowerShell profile: $PROFILE"
        }
        
        # Add aliases to profile
        $aliasContent = @"

# Claude Screenshot System aliases
function ss-latest { & "`$env:USERPROFILE\Pictures\Screenshots\scripts\claude_integration.ps1" -Command latest }
function ss-list { & "`$env:USERPROFILE\Pictures\Screenshots\scripts\claude_integration.ps1" -Command list }
function ss-monitor { & "`$env:USERPROFILE\Pictures\Screenshots\scripts\screenshot_manager.ps1" -Action monitor }

"@
        
        # Check if aliases already exist
        $profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
        if ($profileContent -notlike "*Claude Screenshot System aliases*") {
            Add-Content -Path $PROFILE -Value $aliasContent
            Write-LogSuccess "Added aliases to PowerShell profile"
        } else {
            Write-LogInfo "Aliases already exist in PowerShell profile"
        }
    }
    catch {
        Write-LogError "Failed to setup PowerShell profile: $($_.Exception.Message)"
    }
}

# Verify installation
function Test-Installation {
    Write-LogInfo "Verifying installation..."
    
    $errors = 0
    
    # Check directories
    $requiredDirs = @($Script:InstallDir, $Script:ClaudeCommandsDir, $Script:ScriptsDir)
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-LogSuccess "$dir exists"
        } else {
            Write-LogError "$dir is missing"
            $errors++
        }
    }
    
    # Check PowerShell scripts
    $requiredScripts = @(
        "$Script:ScriptsDir\screenshot_manager.ps1",
        "$Script:ScriptsDir\claude_integration.ps1"
    )
    foreach ($script in $requiredScripts) {
        if (Test-Path $script) {
            Write-LogSuccess "$script exists"
        } else {
            Write-LogError "$script is missing"
            $errors++
        }
    }
    
    # Check Claude commands
    $requiredCommands = @(
        "$Script:ClaudeCommandsDir\ss.md",
        "$Script:ClaudeCommandsDir\sslist.md",
        "$Script:ClaudeCommandsDir\ssshow.md"
    )
    foreach ($command in $requiredCommands) {
        if (Test-Path $command) {
            Write-LogSuccess "$command exists"
        } else {
            Write-LogError "$command is missing"
            $errors++
        }
    }
    
    if ($errors -eq 0) {
        Write-LogSuccess "Installation verified successfully!"
        return $true
    } else {
        Write-LogError "Installation has $errors error(s)"
        return $false
    }
}

# Main execution
function Start-Installation {
    Write-Host "=== Claude Screenshot System - Windows Installer ===" -ForegroundColor Blue
    Write-Host ""
    
    if ($Script:IsWSL) {
        Write-Host "WSL environment detected. This installer will set up screenshot integration for Windows." -ForegroundColor Yellow
    }
    
    if ($Force -or (Read-Host "Proceed with installation? [y/N]") -match '^[Yy]$') {
        Set-ExecutionPolicyIfNeeded
        New-InstallDirectories
        Install-PowerShellScripts
        Install-ClaudeCommands
        Setup-PowerShellProfile
        
        if (Test-Installation) {
            Write-LogSuccess "Installation completed successfully!"
            Write-Host ""
            Write-Host "Available commands:" -ForegroundColor Green
            Write-Host "  Claude Code: /ss, /sslist, /ssshow" -ForegroundColor White
            Write-Host "  PowerShell: ss-latest, ss-list, ss-monitor" -ForegroundColor White
            Write-Host ""
            Write-Host "Screenshot directory: $Script:InstallDir" -ForegroundColor White
            Write-Host ""
            Write-Host "Note: Restart PowerShell or run 'Import-Module `$PROFILE' to use new aliases" -ForegroundColor Yellow
        } else {
            Write-LogError "Installation completed with errors."
            exit 1
        }
    } else {
        Write-LogInfo "Installation cancelled."
        exit 0
    }
}

# Command handling
if ($Help) {
    Show-Help
    exit 0
}

# Run installation
Start-Installation