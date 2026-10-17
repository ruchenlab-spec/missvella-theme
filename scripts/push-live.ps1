# 安全推送主题到线上（保护主题编辑器里的商家配置）
#
# 背景：
#   config/settings_data.json 和 templates/*.json 保存的是商家在主题编辑器里
#   配置的内容（图片、文案、区块结构与设置）。全量 push 会用本地旧版本覆盖它们，
#   导致商家配置被还原。
#
# 用法：
#   .\scripts\push-live.ps1                    # 只推代码（assets/sections/snippets/blocks/layout/locales）
#   .\scripts\push-live.ps1 -PullContent       # 先拉线上内容与模板，再推全量（推荐在改过模板结构后使用）
#   .\scripts\push-live.ps1 -IncludeContent    # 推全量（会把本地 templates/config 覆盖到线上，慎用）
#
# 改模板结构（templates/*.json）的正确顺序：
#   1) shopify theme pull --store <store> --theme <id> --only "templates/index.json"
#   2) 修改本地文件
#   3) .\scripts\push-live.ps1 -PullContent   （或 --only "templates/index.json" 单独推）

param(
    [string]$Store = "6icwx6-yv.myshopify.com",
    [string]$ThemeId = "167137378374",
    [switch]$IncludeContent,
    [switch]$PullContent
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

try {
    if ($PullContent) {
        Write-Host "== 拉取线上内容与模板（保留编辑器里的商家配置）==" -ForegroundColor Cyan
        & shopify theme pull --store $Store --theme $ThemeId `
            --only "config/settings_data.json" `
            --only "templates/*.json" `
            --only "sections/*.json" `
            --path "theme"
    }

    if ($IncludeContent) {
        Write-Host "== 全量推送（会覆盖线上 templates/config）==" -ForegroundColor Yellow
        & shopify theme push --store $Store --theme $ThemeId --allow-live --path "theme"
    }
    else {
        Write-Host "== 推送代码文件（不触碰 templates/config）==" -ForegroundColor Cyan
        & shopify theme push --store $Store --theme $ThemeId --allow-live --path "theme" `
            --only "assets/*" `
            --only "sections/*.liquid" `
            --only "snippets/*" `
            --only "blocks/*" `
            --only "layout/*" `
            --only "locales/*"
    }
}
finally {
    Pop-Location
}
