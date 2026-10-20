<#
    Gera o .ZIP de entrega de uma parcial contendo SOMENTE os arquivos daquela parcial.

    Usa lista de inclusão (whitelist) por parcial: código de parciais futuras e qualquer
    arquivo fora da lista (configurações de editor, controle de versão, documentos de
    trabalho do grupo) ficam de fora. Credenciais locais nunca são empacotadas.

    Uso (na raiz do projeto):
        powershell -ExecutionPolicy Bypass -File scripts\empacotar.ps1 -Parcial 1
#>
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet(1, 2, 3)]
    [int] $Parcial
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

# Páginas na raiz: .html nas Parciais 1 e 2; .php na Parcial 3
$rootFilePatterns = @{
    1 = @('*.html')
    2 = @('*.html')
    3 = @('*.php')
}[$Parcial]

# Pastas que cada parcial entrega
$includedDirs = @{
    1 = @('assets/css', 'assets/img')
    2 = @('assets/css', 'assets/img', 'assets/js')
    3 = @('assets/css', 'assets/img', 'assets/js', 'api', 'src', 'database')
}[$Parcial]

# Arquivos avulsos: origem no projeto -> caminho dentro do ZIP
$extraFiles = @{
    'docs/INSTRUCOES.txt' = 'INSTRUCOES.txt'
}

# O que nunca entra, mesmo estando dentro das pastas acima
$excludedFiles = @('src/config/config.php')

# Stubs de parciais futuras que ficam dentro de pastas já entregues
$futureFiles = @{
    1 = @()
    2 = @(
        'assets/js/data/ApiMatchRepository.js',
        'assets/js/data/httpClient.js',
        'assets/js/pages/ranking.js',
        'assets/js/ui/RankingView.js'
    )
    3 = @()
}[$Parcial]
$excludedFiles += $futureFiles
$excludedNames = @('.gitkeep')

function Get-RelativePath([string] $fullPath) {
    return $fullPath.Substring($root.Length + 1).Replace('\', '/')
}

# Monta a lista: caminho no disco -> caminho no ZIP
$entries = [ordered]@{}
foreach ($pattern in $rootFilePatterns) {
    foreach ($file in Get-ChildItem -Path $root -Filter $pattern -File) {
        $entries[$file.FullName] = Get-RelativePath $file.FullName
    }
}
foreach ($dir in $includedDirs) {
    $dirPath = Join-Path $root $dir
    if (-not (Test-Path $dirPath)) { continue }
    foreach ($file in Get-ChildItem -Path $dirPath -Recurse -File -Force) {
        $relative = Get-RelativePath $file.FullName
        if (($excludedFiles -notcontains $relative) -and ($excludedNames -notcontains $file.Name)) {
            $entries[$file.FullName] = $relative
        }
    }
}
foreach ($source in $extraFiles.Keys) {
    $sourcePath = Join-Path $root $source
    if (-not (Test-Path $sourcePath)) { throw "Arquivo obrigatório não encontrado: $source" }
    $entries[(Resolve-Path $sourcePath).Path] = $extraFiles[$source]
}

$zipPath = Join-Path $root ("Parcial-{0}.zip" -f $Parcial)
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# ZipArchive com '/' nos caminhos: o Compress-Archive do PowerShell 5.1 grava '\',
# o que quebra a estrutura de pastas ao extrair em Linux/macOS.
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
    foreach ($source in $entries.Keys) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $source, $entries[$source]) | Out-Null
    }
}
finally {
    $zip.Dispose()
}

$sizeMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host ("Gerado: {0} ({1} arquivos, {2} MB)" -f (Split-Path $zipPath -Leaf), $entries.Count, $sizeMb)
if ($sizeMb -gt 10) {
    Write-Warning 'O ZIP excede 10 MB (limite do Moodle). Veja as regras sobre arquivos grandes.'
}
if (Select-String -Path (Join-Path $root 'docs/INSTRUCOES.txt') -Pattern '<link aqui>' -SimpleMatch -Quiet) {
    Write-Warning 'O link do vídeo ainda não foi preenchido em docs/INSTRUCOES.txt.'
}
