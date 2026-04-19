$path = "src/app/command/page.tsx"
$content = Get-Content $path -Encoding UTF8
$newContent = @()
$foundCount = 0

foreach ($line in $content) {
    # 1. Add Import
    if ($line -match "import UserDirectory from") {
        $newContent += $line
        $newContent += "import ZoneManagement from './components/ZoneManagement';"
        $foundCount++
        continue
    }

    # 2. Add Render Case
    if ($line -match "case 'map':") {
        $newContent += $line
        $newContent += "      case 'infrastructure': return <ZoneManagement zones={zones} setZones={setZones} refreshZones={fetchZones} />;"
        $foundCount++
        continue
    }

    # 3. Add Nav Item
    if ($line -match 'label="LIVE MAP"') {
        $newContent += $line
        $newContent += '          <NavItem icon={<Building2 size={18} />} label="INFRASTRUCTURE" active={activeTab === "infrastructure"} onClick={() => setActiveTab("infrastructure")} />'
        $foundCount++
        continue
    }

    $newContent += $line
}

if ($foundCount -ge 3) {
    $newContent | Out-File $path -Encoding UTF8
    Write-Host "SUCCESS: $foundCount points updated."
} else {
    Write-Host "FAILURE: Only $foundCount points found."
}
