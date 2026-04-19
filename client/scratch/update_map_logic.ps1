$path = "src/app/command/page.tsx"
$content = Get-Content $path -Encoding UTF8
$newContent = @()

foreach ($line in $content) {
    if ($line -match "const config = ZONE_LOOKUP\[zone.name\]") {
        $newContent += "                const config = (zone.pos_x !== undefined && zone.pos_y !== undefined) "
        $newContent += "                  ? { top: `${zone.pos_y}%`, left: `${zone.pos_x}%`, color: '#6366f1', icon: <MapPin size={12} /> }"
        $newContent += "                  : (ZONE_LOOKUP[zone.name] || { top: '50%', left: '50%', color: '#64748b' });"
    } else {
        $newContent += $line
    }
}

$newContent | Out-File $path -Encoding UTF8
Write-Host "SUCCESS: Map logic updated."
