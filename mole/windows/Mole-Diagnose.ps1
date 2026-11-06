# Feedback mode is independent of the installed Mole version and never runs the legacy
# network/license probes below. PowerShell 5.1, ordinary user permissions.
[CmdletBinding()]
param([switch]$Feedback, [switch]$ChooseFolder, [string]$TargetPath, [string]$OutputDirectory)

function Invoke-MoleFeedback {
    param([string]$Folder, [string]$Destination)
    $ErrorActionPreference = 'Stop'
    # These helpers run in isolated, time-bounded PowerShell workers. Only allowlisted
    # fields leave a worker: no exception messages, command lines or private file names.
    $helpers = {
        $ErrorActionPreference = 'Stop'
        function Safe-Version($value) {
            if ([string]$value -match '^\d[0-9A-Za-z.+_-]{0,63}$') { return [string]$value }
            return $null
        }
        function Read-SmallText([string]$path) {
            if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { return $null }
            $item = Get-Item -LiteralPath $path -Force
            if ($item.Length -gt 1MB -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Metadata refused' }
            return [IO.File]::ReadAllText($path)
        }
        function Path-Id($path) {
            if ([string]::IsNullOrWhiteSpace($path)) { return $null }
            try { $path = [IO.Path]::GetFullPath(([string]$path).Trim('"')).TrimEnd('\').ToLowerInvariant() }
            catch { return 'invalid' }
            if (-not $script:pathIds.ContainsKey($path)) { $script:pathIds[$path] = 'path-' + ($script:pathIds.Count + 1) }
            return $script:pathIds[$path]
        }
        function Error-Status($record) {
            if ($record.Exception -is [UnauthorizedAccessException] -or $record.CategoryInfo.Category -eq 'PermissionDenied') { return 'denied' }
            if ($record.CategoryInfo.Category -eq 'ObjectNotFound') { return 'missing' }
            return 'unavailable'
        }
        function KV($text, $name) {
            $m = [regex]::Match([string]$text, '"' + [regex]::Escape($name) + '"\s*"([^"\r\n]*)"')
            if ($m.Success) { return $m.Groups[1].Value }
            return $null
        }
        function App-Label($name) {
            if ($name -match '^Steam$') { return 'Steam' }
            if ($name -match '^WARDOGS$') { return 'WARDOGS' }
            if ($name -match 'ACE COMBAT 8') { return 'ACE COMBAT 8' }
            if ($name -match 'The Witcher 3|巫师3|巫師3') { return 'The Witcher 3' }
            if ($name -match '^Git(?: version)?(?: \d[0-9A-Za-z.+_-]*)?$') { return 'Git' }
            if ($name -match '^(Gyan\.)?FFmpeg( |$)') { return 'FFmpeg' }
            return $null
        }
        function Executable-Only($command) {
            $m = [regex]::Match([string]$command, '^\s*"([^"]+\.exe)"|^\s*(.+?\.exe)(?:\s|,|$)', 'IgnoreCase')
            if ($m.Groups[1].Success) { return $m.Groups[1].Value }
            if ($m.Groups[2].Success) { return $m.Groups[2].Value }
            return $null
        }
        function Initialize-MetadataWalker {
            if ('MoleFeedbackNative' -as [type]) { return }
            Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
public static class MoleFeedbackNative {
    [DllImport("kernel32.dll")] public static extern ulong GetTickCount64();
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] struct Entry {
        public uint attributes; public System.Runtime.InteropServices.ComTypes.FILETIME creation, access, write;
        public uint high, low, tag, reserved;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst=260)] public string name;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst=14)] public string alternate;
    }
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern IntPtr FindFirstFileW(string path, out Entry entry);
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool FindNextFileW(IntPtr handle, out Entry entry);
    [DllImport("kernel32.dll")] static extern bool FindClose(IntPtr handle);
    public sealed class Summary {
        public string Status = "complete";
        public long Files, Directories, LongPaths, MaxPathCharacters, ReparseSkipped, ArchivesSkipped, Errors, ElapsedMs;
        public long? LogicalBytes;
        public string Accounting = "logical bytes; hard links counted per name; no file contents read";
    }
    public static Summary Scan(string root, int milliseconds, int maxEntries) {
        var r = new Summary(); var clock = Stopwatch.StartNew();
        try {
            root = Path.GetFullPath(root).TrimEnd('\\');
            if (root.Length < 4 || root[1] != ':' || root[2] != '\\') { r.Status="refused-root-or-network"; return r; }
            foreach (var archive in new[]{@"\.codex\sessions", @"\.claude\projects"}) {
                var at=root.IndexOf(archive,StringComparison.OrdinalIgnoreCase);
                if(at>=0 && (at+archive.Length==root.Length || root[at+archive.Length]=='\\')) {r.Status="refused-chat-archive";return r;}
            }
            var drive = new DriveInfo(Path.GetPathRoot(root));
            if (drive.DriveType != DriveType.Fixed) { r.Status="refused-nonfixed"; return r; }
            for (var p = new DirectoryInfo(root); p != null; p = p.Parent) {
                if ((File.GetAttributes(p.FullName) & FileAttributes.ReparsePoint) != 0) { r.Status="refused-reparse"; return r; }
            }
            if (!Directory.Exists(root)) { r.Status="missing"; return r; }
            r.LogicalBytes=0;
            var pending = new Stack<string>(); pending.Push(root);
            while (pending.Count != 0) {
                if (clock.ElapsedMilliseconds >= milliseconds || r.Files+r.Directories >= maxEntries) { r.Status="partial-limit"; break; }
                var dir = pending.Pop(); Entry e;
                // Recheck every queued directory. Never enter known junctions or cloud placeholders.
                if ((File.GetAttributes("\\\\?\\"+dir) & FileAttributes.ReparsePoint) != 0) { r.ReparseSkipped++; continue; }
                var h = FindFirstFileW("\\\\?\\"+dir+"\\*", out e);
                if (h == new IntPtr(-1)) { var err=Marshal.GetLastWin32Error(); if(err!=2) r.Errors++; continue; }
                try {
                    while (true) {
                        if (e.name != "." && e.name != "..") {
                            var path=dir+"\\"+e.name; var len=path.Length;
                            r.MaxPathCharacters=Math.Max(r.MaxPathCharacters,len); if(len>=260) r.LongPaths++;
                            if ((e.attributes & (0x400u|0x1000u|0x40000u|0x400000u)) != 0) r.ReparseSkipped++;
                            else if ((e.attributes & 0x10) != 0) {
                                r.Directories++;
                                // Chat archives are not a cache and are outside this diagnostic's scope.
                                if (!(dir.EndsWith("\\.codex",StringComparison.OrdinalIgnoreCase) && e.name.Equals("sessions",StringComparison.OrdinalIgnoreCase)) &&
                                    !(dir.EndsWith("\\.claude",StringComparison.OrdinalIgnoreCase) && e.name.Equals("projects",StringComparison.OrdinalIgnoreCase))) pending.Push(path);
                                else r.ArchivesSkipped++;
                            } else { r.Files++; r.LogicalBytes += ((long)e.high<<32)+e.low; }
                        }
                        if (clock.ElapsedMilliseconds >= milliseconds || r.Files+r.Directories >= maxEntries) { r.Status="partial-limit"; break; }
                        if (!FindNextFileW(h,out e)) { if(Marshal.GetLastWin32Error()!=18) r.Errors++; break; }
                    }
                } finally { FindClose(h); }
                if (r.Status=="partial-limit") break;
            }
            if(r.Status=="complete" && (r.Errors>0 || r.ReparseSkipped>0 || r.ArchivesSkipped>0)) r.Status="partial-skipped";
        } catch (UnauthorizedAccessException) { r.Status="denied"; }
          catch (DirectoryNotFoundException) { r.Status="missing"; }
          catch (FileNotFoundException) { r.Status="missing"; }
          catch { r.Status="unavailable"; }
        finally { r.ElapsedMs=clock.ElapsedMilliseconds; }
        return r;
    }
}
'@
        }
    }
    $sections = [ordered]@{
        System = {
            Initialize-MetadataWalker
            [pscustomobject]@{ Kind='Clock'; TickMilliseconds=[MoleFeedbackNative]::GetTickCount64(); TimeZoneOffsetMinutes=[DateTimeOffset]::Now.Offset.TotalMinutes }
            $os = Get-CimInstance Win32_OperatingSystem -OperationTimeoutSec 8
            [pscustomobject]@{ Kind='Windows'; Version=$os.Version; Build=$os.BuildNumber; LastBootUtc=$os.LastBootUpTime.ToUniversalTime().ToString('o'); CimUptimeSeconds=((Get-Date)-$os.LastBootUpTime).TotalSeconds; MemoryKiB=$os.TotalVisibleMemorySize; FreeMemoryKiB=$os.FreePhysicalMemory; Architecture=$env:PROCESSOR_ARCHITECTURE; Locale=(Get-UICulture).Name }
            try {
                $fast=(Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power' -Name HiberbootEnabled).HiberbootEnabled
                [pscustomobject]@{ Kind='FastStartupConfiguration'; Enabled=($fast-eq 1); Note='Configuration does not prove the last boot type' }
            } catch { [pscustomobject]@{ Kind='FastStartupConfiguration'; Status=(Error-Status $_) } }
            foreach($provider in @('Microsoft-Windows-Kernel-Boot','Microsoft-Windows-Power-Troubleshooter')) {
                try {
                    $ids=if($provider -eq 'Microsoft-Windows-Kernel-Boot') { @(27) } else { @(1) }
                    Get-WinEvent -FilterHashtable @{LogName='System';ProviderName=$provider;Id=$ids;StartTime=(Get-Date).AddDays(-14)} -MaxEvents 8 | ForEach-Object {
                        $x=[xml]$_.ToXml(); $boot=$null
                        foreach($d in $x.Event.EventData.Data) { if($d.Name -eq 'BootType') { $boot=[string]$d.'#text' } }
                        [pscustomobject]@{ Kind='PowerEvent'; Provider=$provider; Id=$_.Id; Utc=$_.TimeCreated.ToUniversalTime().ToString('o'); BootType=$boot }
                    }
                } catch { [pscustomobject]@{ Kind='PowerEvents'; Provider=$provider; Status=(Error-Status $_) } }
            }
            Get-CimInstance Win32_Processor -OperationTimeoutSec 8 | Select-Object @{n='Kind';e={'CPU'}},Name,NumberOfCores,NumberOfLogicalProcessors
            Get-CimInstance Win32_VideoController -OperationTimeoutSec 8 | Select-Object @{n='Kind';e={'GPU'}},Name,DriverVersion
        }
        Mole = {
            $exe=Join-Path $env:LOCALAPPDATA 'Tw93.Mole\current\Mole.exe'
            [pscustomobject]@{ Kind='Installed'; Exists=(Test-Path -LiteralPath $exe); Version=$(if(Test-Path -LiteralPath $exe){Safe-Version (Get-Item -LiteralPath $exe).VersionInfo.ProductVersion}) }
            $ps=@(Get-Process -Name Mole -ErrorAction SilentlyContinue)
            foreach($p in $ps) { [pscustomobject]@{ Kind='Running'; Version=(Safe-Version $p.ProductVersion); WorkingSetBytes=$p.WorkingSet64; Responding=$p.Responding; HasWindow=($p.MainWindowHandle -ne 0) } }
            if($ps.Count-eq 0){[pscustomobject]@{Kind='Running';Status='not-running'}}
            $settings=Read-SmallText (Join-Path $env:LOCALAPPDATA 'Mole\settings.json')
            if($settings){$s=$settings|ConvertFrom-Json; [pscustomobject]@{Kind='Settings'; Language=$(if([string]$s.Language -match '^[a-z]{2}(-[A-Za-z]{2,4})?$'){$s.Language}); Note='Only UI language is collected; no license, settings dump or logs'}}
        }
        Apps = {
            Initialize-MetadataWalker
            $script:pathIds=@{}; $rows=New-Object System.Collections.Generic.List[object]; $roots=New-Object System.Collections.Generic.List[string]
            foreach($hive in @([Microsoft.Win32.RegistryHive]::LocalMachine,[Microsoft.Win32.RegistryHive]::CurrentUser)) {
                foreach($view in @([Microsoft.Win32.RegistryView]::Registry64,[Microsoft.Win32.RegistryView]::Registry32)) {
                    $base=$null;$un=$null
                    try {
                        $base=[Microsoft.Win32.RegistryKey]::OpenBaseKey($hive,$view); $un=$base.OpenSubKey('SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall')
                        if(-not $un){continue}
                        foreach($key in $un.GetSubKeyNames()) {
                            $k=$un.OpenSubKey($key); if(-not $k){continue}
                            try {
                                $label=App-Label $k.GetValue('DisplayName'); if(-not $label){continue}
                                $loc=[string]$k.GetValue('InstallLocation'); $command=Executable-Only $k.GetValue('UninstallString'); $icon=Executable-Only $k.GetValue('DisplayIcon')
                                $id=if($key-match '^Steam App (\d+)$'){$Matches[1]}else{$null}
                                $estimate=$k.GetValue('EstimatedSize'); $size=if(($estimate-is [int] -or $estimate-is [long]) -and $estimate-ge 0){[long]$estimate*1024}else{$null}
                                $row=[pscustomobject]@{Kind='Registration'; App=$label; Hive=[string]$hive; View=[string]$view; AppId=$id; Version=(Safe-Version $k.GetValue('DisplayVersion')); EstimatedBytes=$size; InstallPathId=(Path-Id $loc); UninstallerPathId=(Path-Id $command); UninstallerFolderId=$(if($command){Path-Id ([IO.Path]::GetDirectoryName($command))}); UninstallerIsSteam=($command -match '\\steam\.exe$'); IconPathId=(Path-Id $icon); InstallLocationPresent=(-not [string]::IsNullOrWhiteSpace($loc))}
                                $row; $rows.Add([pscustomobject]@{App=$label;AppId=$id;Location=$loc})
                                if($label-eq 'Steam' -and $loc){$roots.Add($loc)}
                                if($command-match '\\steam\.exe$'){$roots.Add([IO.Path]::GetDirectoryName($command))}
                            } finally {$k.Dispose()}
                        }
                    } catch {[pscustomobject]@{Kind='RegistrationRead';Hive=[string]$hive;View=[string]$view;Status=(Error-Status $_)}}
                    finally {if($un){$un.Dispose()};if($base){$base.Dispose()}}
                }
            }
            try { $steam=(Get-ItemProperty 'HKCU:\Software\Valve\Steam' -Name SteamPath).SteamPath; if($steam){$roots.Add($steam.Replace('/','\'))} } catch {}
            $libraries=New-Object System.Collections.Generic.List[string]
            foreach($root in @($roots|Select-Object -Unique)) {
                $libraries.Add($root)
                try { $vdf=Read-SmallText (Join-Path $root 'steamapps\libraryfolders.vdf'); foreach($m in [regex]::Matches([string]$vdf,'"path"\s*"([^"\r\n]+)"')){$libraries.Add($m.Groups[1].Value.Replace('\\','\'))} }
                catch {[pscustomobject]@{Kind='SteamLibraries';RootId=(Path-Id $root);Status=(Error-Status $_)}}
            }
            $matched=0
            foreach($library in @($libraries|Select-Object -Unique|Select-Object -First 16)) {
                try {
                    $common=Join-Path $library 'steamapps\common'
                    $manifests=@(Get-ChildItem -LiteralPath (Join-Path $library 'steamapps') -Filter 'appmanifest_*.acf' -File | Select-Object -First 1024)
                    foreach($file in $manifests) {
                        $acf=Read-SmallText $file.FullName; $label=App-Label (KV $acf 'name'); if($label-notin @('WARDOGS','ACE COMBAT 8','The Witcher 3')){continue}
                        $appid=KV $acf 'appid'; if($appid-notmatch '^\d+$'){continue}; $leaf=KV $acf 'installdir'
                        if(-not $leaf -or $leaf.IndexOfAny([IO.Path]::GetInvalidFileNameChars())-ge 0 -or $leaf-in @('.','..')){continue}
                        $game=Join-Path $common $leaf; $raw=KV $acf 'SizeOnDisk';$bytes=if($raw-match '^\d{1,18}$'){[long]$raw}else{$null};$matched++
                        [pscustomobject]@{Kind='SteamManifest';App=$label;AppId=$appid;LibraryId=(Path-Id $library);CommonId=(Path-Id $common);GameId=(Path-Id $game);ManifestBytes=$bytes; GameDirectoryExists=(Test-Path -LiteralPath $game -PathType Container); DirectoryMeasurement=[MoleFeedbackNative]::Scan($game,2000,50000)}
                        foreach($row in @($rows|Where-Object App -eq $label)) {
                            $loc=$row.Location.TrimEnd('\'); [pscustomobject]@{Kind='Ownership';App=$label; AppIdMatches=($row.AppId-eq $appid);RegisteredLocationIsGame=($loc-eq $game);RegisteredLocationIsLibrary=($loc-eq $library.TrimEnd('\'));RegisteredLocationIsCommon=($loc-eq $common)}
                        }
                    }
                }catch{[pscustomobject]@{Kind='SteamManifests';LibraryId=(Path-Id $library);Status=(Error-Status $_)}}
            }
            [pscustomobject]@{Kind='SteamSummary';MatchingManifests=$matched;LibraryRoots=$libraries.Count;Note='Path IDs are local to this section. Metadata is not Mole runtime size or allocated disk usage.'}
        }
        Updates = {
            $pkg=Get-AppxPackage -Name Microsoft.DesktopAppInstaller | Select-Object -First 1
            [pscustomobject]@{Kind='WingetProvider'; AppInstallerVersion=$(if($pkg){[string]$pkg.Version}); Present=[bool]$pkg; Note='No winget command, update or network query is executed'}
            foreach($name in @('winget','ffmpeg','git','scoop')) {
                $c=Get-Command $name -ErrorAction SilentlyContinue | Select-Object -First 1
                [pscustomobject]@{Kind='Command';Name=$name;Found=[bool]$c;FileVersion=$(if($c -and $c.CommandType-eq 'Application'){Safe-Version (Get-Item -LiteralPath $c.Source).VersionInfo.ProductVersion})}
            }
            foreach($app in @('git','ffmpeg')) {
                $scoop=if($env:SCOOP){$env:SCOOP}else{Join-Path $env:USERPROFILE 'scoop'}
                $manifest=Read-SmallText (Join-Path $scoop "apps\$app\current\manifest.json")
                [pscustomobject]@{Kind='ScoopPackage';App=$app;Version=$(if($manifest){Safe-Version ($manifest|ConvertFrom-Json).version});Present=[bool]$manifest}
            }
            foreach($name in @('winget','msiexec','git','ffmpeg')) { [pscustomobject]@{Kind='ProcessCount';Name=$name;Count=@(Get-Process -Name $name -ErrorAction SilentlyContinue).Count} }
            [pscustomobject]@{Kind='Limits';Note='Historical clicks, active Mole OperationGate and queue contents are not available to an external script'}
        }
        Storage = {
            Initialize-MetadataWalker
            Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' -OperationTimeoutSec 8 | Select-Object @{n='Kind';e={'Disk'}},DeviceID,FileSystem,Size,FreeSpace
            $paths=[ordered]@{LocalTemp=(Join-Path $env:LOCALAPPDATA 'Temp');Npm=(Join-Path $env:LOCALAPPDATA 'npm-cache');Pip=(Join-Path $env:LOCALAPPDATA 'pip\Cache');Nuget=(Join-Path $env:USERPROFILE '.nuget\packages');Gradle=(Join-Path $env:USERPROFILE '.gradle\caches');Cargo=(Join-Path $env:USERPROFILE '.cargo\registry')}
            foreach($name in $paths.Keys){[pscustomobject]@{Kind='KnownDirectory';Name=$name;Measurement=[MoleFeedbackNative]::Scan($paths[$name],2000,25000)}}
            [pscustomobject]@{Kind='Limits';Note='Occupancy is not safe-to-delete space. No whole-profile, drive-root, registry-cleaning or project scan.'}
        }
        RecycleTarget = {
            if(-not $args[0]){[pscustomobject]@{Kind='Target';Status='not-selected'};return}
            Initialize-MetadataWalker
            $measurement=[MoleFeedbackNative]::Scan($args[0],15000,150000)
            [pscustomobject]@{Kind='Target';Measurement=$measurement;Note='Read-only metadata scan time is not the previous recycle operation time'}
            try {
                $path=[IO.Path]::GetFullPath($args[0]);$drive=New-Object IO.DriveInfo ([IO.Path]::GetPathRoot($path))
                [pscustomobject]@{Kind='TargetVolume';Type=[string]$drive.DriveType;FileSystem=$drive.DriveFormat}
                # Values only. Volume GUIDs and user SIDs never leave the worker.
                $key='HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\BitBucket\Volume'
                $index=0
                if(Test-Path $key){Get-ChildItem $key|Select-Object -First 16|ForEach-Object{$v=Get-ItemProperty $_.PSPath;[pscustomobject]@{Kind='RecyclePolicy';Index=$index++;MaxCapacityMiB=$v.MaxCapacity;NukeOnDelete=$v.NukeOnDelete;Note='Unmapped volume policy, not proof of target recoverability'}}}
            } catch {[pscustomobject]@{Kind='TargetVolume';Status=(Error-Status $_)}}
        }
    }
    $report=[ordered]@{Schema='mole-windows-feedback-1';CollectedUtc=[DateTime]::UtcNow.ToString('o');Sections=[ordered]@{}}
    foreach($name in $sections.Keys) {
        Write-Host "Collecting $name..."
        $job=$null;$timer=[Diagnostics.Stopwatch]::StartNew()
        try {
            $job=Start-Job -InitializationScript $helpers -ScriptBlock $sections[$name] -ArgumentList $Folder
            $done=Wait-Job $job -Timeout 35
            $rows=@(Receive-Job $job -ErrorAction SilentlyContinue)
            $status=if(-not $done){'timeout'}elseif($job.State-eq 'Failed'){'unavailable'}else{'complete'}
            # Remoting adds machine identifiers to returned objects; rebuild each row.
            $cleanRows=@(foreach($row in $rows){$clean=[ordered]@{};foreach($p in $row.PSObject.Properties){if($p.Name-notin @('PSComputerName','RunspaceId','PSShowComputerName')){$clean[$p.Name]=$p.Value}};[pscustomobject]$clean})
            $report.Sections[$name]=[ordered]@{Status=$status;ElapsedMs=$timer.ElapsedMilliseconds;Data=$cleanRows}
        }catch{$report.Sections[$name]=[ordered]@{Status='unavailable'}}
        finally{if($job){if($job.State-eq 'Running'){Stop-Job $job};Remove-Job $job -Force}}
    }
    if(-not $Destination){$Destination=[Environment]::GetFolderPath('Desktop')}
    if(-not [IO.Directory]::Exists($Destination)){throw 'Output folder does not exist'}
    $file=Join-Path $Destination ('Mole-Feedback-'+(Get-Date -Format 'yyyyMMdd-HHmmss')+'.txt')
    $text=$report|ConvertTo-Json -Depth 12
    # A final guard also covers provider-supplied display names; never emit raw exceptions.
    foreach($private in @($env:USERPROFILE,$env:COMPUTERNAME,$env:USERNAME)) {
        if($private -and $private.Length-ge 3){$text=$text -replace [regex]::Escape($private.Replace('\','\\')),'[redacted]';$text=$text -replace [regex]::Escape($private),'[redacted]'}
    }
    [IO.File]::WriteAllText($file,$text,(New-Object Text.UTF8Encoding $true))
    Write-Host "Saved: $file"
    Write-Host 'Review this file before sharing it with Mole support. Nothing was uploaded or copied to the clipboard.'
}

if($Feedback) {
    if($ChooseFolder -and -not $TargetPath) {
        Add-Type -AssemblyName System.Windows.Forms
        $picker=New-Object Windows.Forms.FolderBrowserDialog
        $picker.Description='Select the folder that was slow to recycle. Cancel to skip. Nothing will be deleted.'
        $picker.ShowNewFolderButton=$false
        try {if($picker.ShowDialog()-eq [Windows.Forms.DialogResult]::OK){$TargetPath=$picker.SelectedPath}}finally{$picker.Dispose()}
    }
    Invoke-MoleFeedback -Folder $TargetPath -Destination $OutputDirectory
    return
}

# Mole for Windows diagnostics: one run collects what support needs into a text file on the Desktop
# and the clipboard. Read-only: it changes nothing, and it never reads license.dat or trial.dat
# (only whether they exist). Run it in PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\Mole-Diagnose.ps1
$ErrorActionPreference = "SilentlyContinue"
$out = New-Object System.Collections.Generic.List[string]
function Section($name) { $out.Add(""); $out.Add("== $name") }
function Line($text) { $out.Add([string]$text) }
function Try-Run($block) { try { & $block } catch { Line "  (failed: $($_.Exception.Message))" } }

Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public static class MoleDiag {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)] public struct MONITORINFOEX {
    public int cbSize; public RECT rcMonitor; public RECT rcWork; public uint dwFlags;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string szDevice; }
  delegate bool MonitorEnumProc(IntPtr h, IntPtr hdc, ref RECT r, IntPtr data);
  [DllImport("user32.dll")] static extern bool EnumDisplayMonitors(IntPtr hdc, IntPtr clip, MonitorEnumProc cb, IntPtr data);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern bool GetMonitorInfo(IntPtr h, ref MONITORINFOEX info);
  [DllImport("shcore.dll")] static extern int GetDpiForMonitor(IntPtr h, int type, out uint x, out uint y);
  [DllImport("user32.dll")] public static extern IntPtr SetProcessDpiAwarenessContext(IntPtr value);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr h);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr h);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int attr, out RECT r, int size);
  public static List<string> Monitors() {
    var list = new List<string>();
    EnumDisplayMonitors(IntPtr.Zero, IntPtr.Zero, (IntPtr h, IntPtr hdc, ref RECT r, IntPtr d) => {
      var info = new MONITORINFOEX(); info.cbSize = Marshal.SizeOf(typeof(MONITORINFOEX));
      GetMonitorInfo(h, ref info);
      uint dx, dy; GetDpiForMonitor(h, 0, out dx, out dy);
      double s = dx / 96.0;
      int w = info.rcMonitor.Right - info.rcMonitor.Left, hgt = info.rcMonitor.Bottom - info.rcMonitor.Top;
      int ww = info.rcWork.Right - info.rcWork.Left, wh = info.rcWork.Bottom - info.rcWork.Top;
      list.Add(string.Format("{0}{1}: {2}x{3} px at ({4},{5}), scale {6}%, work area {7}x{8} px at ({9},{10}) = {11}x{12} DIP",
        info.szDevice, (info.dwFlags & 1) == 1 ? " (primary)" : "", w, hgt, info.rcMonitor.Left, info.rcMonitor.Top,
        Math.Round(s * 100), ww, wh, info.rcWork.Left, info.rcWork.Top, Math.Round(ww / s), Math.Round(wh / s)));
      return true; }, IntPtr.Zero);
    return list;
  }
}
'@
[MoleDiag]::SetProcessDpiAwarenessContext([IntPtr]::new(-4)) | Out-Null

Line "Mole for Windows diagnostics, $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"

Section "System"
Try-Run {
  $os = Get-CimInstance Win32_OperatingSystem
  $cs = Get-CimInstance Win32_ComputerSystem
  $cv = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"
  Line "Windows: $($os.Caption) $($cv.DisplayVersion) build $($cv.CurrentBuild).$($cv.UBR), $($env:PROCESSOR_ARCHITECTURE)"
  Line "UI language: $((Get-UICulture).Name), region: $((Get-Culture).Name)"
  Line "Model: $($cs.Manufacturer) $($cs.Model) ($((Get-CimInstance Win32_ComputerSystemProduct).Version))"
  Line "CPU: $((Get-CimInstance Win32_Processor | Select-Object -First 1).Name.Trim())"
  Line "Memory: $([math]::Round($cs.TotalPhysicalMemory / 1GB, 1)) GB"
  Get-CimInstance Win32_VideoController | ForEach-Object { Line "GPU: $($_.Name), driver $($_.DriverVersion), $($_.CurrentHorizontalResolution)x$($_.CurrentVerticalResolution) @ $($_.CurrentRefreshRate) Hz" }
  Line "Uptime: $([math]::Round(((Get-Date) - $os.LastBootUpTime).TotalHours, 1)) h"
}

Section "Displays"
Try-Run {
  [MoleDiag]::Monitors() | ForEach-Object { Line $_ }
  $text = (Get-ItemProperty "HKCU:\Software\Microsoft\Accessibility").TextScaleFactor
  Line "Text size (Accessibility): $(if ($text) { "$text%" } else { '100%' })"
  $tb = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
  $settings = (Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3").Settings
  Line "Taskbar: alignment $(if ($tb.TaskbarAl -eq 0) { 'left' } else { 'center' }), auto-hide $(if ($settings -and ($settings[8] -band 1)) { 'on' } else { 'off' })"
}

Section "Appearance"
Try-Run {
  $p = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"
  $d = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\DWM"
  Line "Apps theme: $(if ($p.AppsUseLightTheme -eq 0) { 'dark' } else { 'light' }), system theme: $(if ($p.SystemUsesLightTheme -eq 0) { 'dark' } else { 'light' })"
  Line "Transparency effects: $(if ($p.EnableTransparency -eq 0) { 'off' } else { 'on' }), accent on title bars: $(if ($d.ColorPrevalence -eq 1) { 'on' } else { 'off' }), accent: $('{0:X8}' -f $d.AccentColor)"
  $hc = (Get-ItemProperty "HKCU:\Control Panel\Accessibility\HighContrast").Flags
  Line "High contrast: $(if ($hc -band 1) { 'on' } else { 'off' })"
}

Section "Mole"
Try-Run {
  $root = "$env:LOCALAPPDATA\Tw93.Mole"
  $exe = "$root\current\Mole.exe"
  if (Test-Path $exe) {
    $version = if (Test-Path "$root\current\sq.version") { ([xml](Get-Content "$root\current\sq.version" -Raw)).package.metadata.version } else { "?" }
    $sig = Get-AuthenticodeSignature $exe
    Line "Installed: yes, $version, signature $($sig.Status) by $($sig.SignerCertificate.GetNameInfo(0, $false))"
  } else { Line "Installed: no" }
}
Try-Run {
  $proc = Get-Process Mole | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if ($proc) {
    $h = $proc.MainWindowHandle
    $r = New-Object MoleDiag+RECT; $c = New-Object MoleDiag+RECT; $f = New-Object MoleDiag+RECT
    [MoleDiag]::GetWindowRect($h, [ref]$r) | Out-Null
    [MoleDiag]::GetClientRect($h, [ref]$c) | Out-Null
    [MoleDiag]::DwmGetWindowAttribute($h, 9, [ref]$f, 16) | Out-Null
    $dpi = [MoleDiag]::GetDpiForWindow($h); $s = $dpi / 96
    Line "Window: running pid $($proc.Id) from $($proc.Path)"
    Line "  maximized $([MoleDiag]::IsZoomed($h)), scale $([math]::Round($s * 100))%"
    Line "  outer $($r.Right - $r.Left)x$($r.Bottom - $r.Top) px at ($($r.Left),$($r.Top)); visible frame $($f.Right - $f.Left)x$($f.Bottom - $f.Top) px at ($($f.Left),$($f.Top))"
    Line "  client $($c.Right)x$($c.Bottom) px = $([math]::Round($c.Right / $s))x$([math]::Round($c.Bottom / $s)) DIP"
  } else { Line "Window: Mole is not running with a window" }
}
Try-Run {
  $data = "$env:LOCALAPPDATA\Mole"
  if (Test-Path $data) {
    Get-ChildItem $data -Force | ForEach-Object { Line "  data: $($_.Name) $(if (-not $_.PSIsContainer) { "$($_.Length) bytes" })" }
    if (Test-Path "$data\settings.json") {
      # Settings carry no secret, but mask anything that looks like a key or email all the same.
      $json = (Get-Content "$data\settings.json" -Raw) -replace '(?i)("[^"]*(key|email|token|license)[^"]*"\s*:\s*)"[^"]*"', '$1"***"'
      Line "  settings.json: $($json -replace '\s+', ' ')"
    }
    foreach ($log in "logs\crash.log") {
      if (Test-Path "$data\$log") { Line "  --- $log (last 30 lines)"; Get-Content "$data\$log" -Tail 30 | ForEach-Object { Line "  $_" } }
    }
  }
  foreach ($log in Get-ChildItem "$env:LOCALAPPDATA\Mole\logs\license.log", "$env:LOCALAPPDATA\velopack\*.log", "$env:TEMP\velopack*.log" -ErrorAction SilentlyContinue) {
    Line "  --- $($log.FullName) ($($log.LastWriteTime), last 25 lines)"
    Get-Content $log.FullName -Tail 25 | ForEach-Object { Line "  $_" }
  }
}

Section "Network"
Try-Run {
  $i = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
  Line "User proxy: enabled $($i.ProxyEnable), server '$($i.ProxyServer)', PAC '$($i.AutoConfigURL)', auto-detect $(if ($i.AutoDetect -eq 0) { 'off' } else { 'default' })"
  Line "WinHTTP: $(((netsh winhttp show proxy) -join ' ') -replace '\s+', ' ')"
  $curl = "$env:SystemRoot\System32\curl.exe"
  foreach ($u in "https://live.dodopayments.com/", "https://mole.fit/api/license/devices", "https://cdn.tw93.fun/mole/windows/releases.win-x64.json", "https://www.microsoft.com/") {
    $r = & $curl -s -o NUL -m 12 -w "%{http_code} dns %{time_namelookup}s connect %{time_connect}s tls %{time_appconnect}s total %{time_total}s" $u 2>&1
    Line "  $u => $r"
  }
}

Section "Security"
Try-Run {
  $mp = Get-MpComputerStatus
  if ($mp) { Line "Defender: real-time $($mp.RealTimeProtectionEnabled), engine $($mp.AMEngineVersion), signatures $($mp.AntivirusSignatureLastUpdated)" }
  Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | ForEach-Object { Line "Antivirus registered: $($_.displayName)" }
  $sac = (Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy").VerifiedAndReputablePolicyState
  Line "Smart App Control: $(switch ($sac) { 0 { 'off' } 1 { 'on' } 2 { 'evaluation' } default { 'unknown' } })"
  $ss = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer").SmartScreenEnabled
  Line "SmartScreen for apps: $(if ($ss) { $ss } else { 'default' })"
  Line "This shell: $((whoami /groups | Select-String 'Mandatory Label') -replace '\s+', ' ')"
  foreach ($p in "$env:USERPROFILE\Downloads", "$env:USERPROFILE\Desktop", "$env:LOCALAPPDATA", "$env:TEMP") {
    $label = (icacls $p | Select-String "Mandatory Label") -replace '\s+', ' '
    Line "Integrity label on ${p}: $(if ($label) { $label } else { 'none (medium)' })"
  }
  Get-ChildItem "$env:USERPROFILE\Downloads\Tw93.Mole*Setup*.exe" | ForEach-Object {
    $label = (icacls $_.FullName | Select-String "Mandatory Label") -replace '\s+', ' '
    $zone = (Get-Content $_.FullName -Stream Zone.Identifier) -join ' '
    Line "Setup $($_.Name): $($_.Length) bytes, label $(if ($label) { $label } else { 'none' }), zone '$zone'"
  }
}

$text = $out -join "`r`n"
$file = Join-Path ([Environment]::GetFolderPath("Desktop")) ("Mole-Diagnose-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".txt")
Set-Content -Path $file -Value $text -Encoding UTF8
Set-Clipboard -Value $text
Write-Host "Saved to $file and copied to the clipboard."
