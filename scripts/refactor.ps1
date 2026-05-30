$files = Get-ChildItem -Path src -Recurse -Include *.tsx, *.ts
$replacements = @{
    '@/components/tasks/ProjectList' = '@/components/projects/ProjectList'
    '@/components/tasks/ProjectDetails' = '@/components/projects/ProjectDetails'
    '@/components/tasks/IssueList' = '@/components/issues/IssueList'
    '@/components/tasks/IssueDetails' = '@/components/issues/IssueDetails'
    '@/components/tasks/CycleList' = '@/components/cycles/CycleList'
    '@/components/tasks/CycleDetails' = '@/components/cycles/CycleDetails'
    '@/components/tasks/QuickCreateModal' = '@/components/shared/QuickCreateModal'
    '@/components/tasks/types' = '@/types/models'
    "'./types'" = "'@/types/models'"
    "`"./types`"" = "`"@/types/models`""
    "'./QuickCreateModal'" = "'@/components/shared/QuickCreateModal'"
    "`"./QuickCreateModal`"" = "`"@/components/shared/QuickCreateModal`""
    "'./ProjectList'" = "'@/components/projects/ProjectList'"
    "`"./ProjectList`"" = "`"@/components/projects/ProjectList`""
    "'./ProjectDetails'" = "'@/components/projects/ProjectDetails'"
    "`"./ProjectDetails`"" = "`"@/components/projects/ProjectDetails`""
    "'./IssueList'" = "'@/components/issues/IssueList'"
    "`"./IssueList`"" = "`"@/components/issues/IssueList`""
    "'./IssueDetails'" = "'@/components/issues/IssueDetails'"
    "`"./IssueDetails`"" = "`"@/components/issues/IssueDetails`""
    "'./CycleList'" = "'@/components/cycles/CycleList'"
    "`"./CycleList`"" = "`"@/components/cycles/CycleList`""
    "'./CycleDetails'" = "'@/components/cycles/CycleDetails'"
    "`"./CycleDetails`"" = "`"@/components/cycles/CycleDetails`""
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($null -eq $content) { continue }
    $originalContent = $content
    foreach ($key in $replacements.Keys) {
        if ($content.Contains($key)) {
            $content = $content.Replace($key, $replacements[$key])
        }
    }
    if ($content -cne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "Updated $($file.FullName)"
    }
}
