Param(
    [string]$Path = ".",
    [string]$Out = "files-list.txt",
    [switch]$Recursive
)

if ($Recursive) {
    Get-ChildItem -Path $Path -File -Recurse | Select-Object -ExpandProperty FullName | Out-File -FilePath $Out -Encoding UTF8
} else {
    Get-ChildItem -Path $Path -File | Select-Object -ExpandProperty Name | Out-File -FilePath $Out -Encoding UTF8
}

Write-Output "Lista de arquivos escrita em $Out"

# Exemplos de uso:
# powershell -ExecutionPolicy Bypass -File .\list-files-to-txt.ps1 -Path 'ASAC\\src\\screens\\writing' -Out writing-files.txt
# powershell -ExecutionPolicy Bypass -File .\list-files-to-txt.ps1 -Path 'ASAC\\src\\screens\\session' -Out session-files.txt -Recursive
