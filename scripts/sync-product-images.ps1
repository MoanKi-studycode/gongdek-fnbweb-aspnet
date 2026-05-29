# Copy product images from frontend/public/images/sources to products folders
$root = Split-Path -Parent $PSScriptRoot
$srcRoot = Join-Path $root "frontend\public\images\sources"
$destDirs = @(
    (Join-Path $root "frontend\public\images\products"),
    (Join-Path $root "backend\wwwroot\images\products")
)

$map = @{
    "coffee\bacxiu.png" = "bac-xiu.png"
    "coffee\blackcoffee.png" = "ca-phe-den.png"
    "coffee\milkcoffee.png" = "ca-phe-sua.png"
    "coffee\coconutcoffee.png" = "ca-phe-cot-dua.png"
    "coffee\eggcoffee.png" = "ca-phe-trung.png"
    "coffee\saltcoffee.png" = "ca-phe-muoi.png"
    "daxay\caphedaxay.png" = "ca-phe-da-xay.png"
    "daxay\carameldaxay.png" = "caramel-da-xay.png"
    "daxay\cookiedaxay.png" = "cookie-da-xay.png"
    "daxay\khoaimondaxay.png" = "khoai-mon-da-xay.png"
    "daxay\matchadaxay.png" = "matcha-da-xay.png"
    "daxay\vietquatdaxay.jpg" = "viet-quat-da-xay.jpg"
    "daxay\xoainhietdoidaxay.png" = "xoai-nhiet-doi-da-xay.png"
    "soda\sodablueocean.jpg" = "soda-blue-ocean.jpg"
    "soda\sodachanhdayhoangkim.jpg" = "soda-chanh-day.jpg"
    "soda\sodadautam.jpg" = "soda-dau-tam.jpg"
    "soda\sodadautaybacha.jpg" = "soda-dau-tay-bac-ha.jpg"
    "soda\sodavietquat.jpg" = "soda-viet-quat.jpg"
    "tea\tradaocamsa.jpg" = "tra-dao-cam-sa.jpg"
    "tea\tradautam.jpg" = "tra-dau-tam.jpg"
    "tea\trahoacucmatong.jpg" = "tra-hoa-cuc-mat-ong.jpg"
    "tea\tramangcut.jpg" = "tra-mang-cut.jpg"
    "tea\traoihongchanhday.jpg" = "tra-oi-hong-chanh-day.jpg"
    "tea\trathanhlongdo.jpg" = "tra-thanh-long-do.jpg"
    "tea\travaihoalai.jpg" = "tra-vai-hoa-lai.jpg"
    "trasua\trasuatruyenthong.jpg" = "tra-sua-truyen-thong.jpg"
    "trasua\trasuakhoaimon.jpg" = "tra-sua-khoai-mon.jpg"
    "trasua\trasuamatcha.jpg" = "tra-sua-matcha.jpg"
    "trasua\trasuanuong.jpg" = "tra-sua-nuong.jpg"
    "trasua\trasuathaido.jpg" = "tra-sua-thai-do.jpg"
    "trasua\trasuathaixanh.jpg" = "tra-sua-thai-xanh.jpg"
}

foreach ($dest in $destDirs) {
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
}

foreach ($entry in $map.GetEnumerator()) {
    $source = Join-Path $srcRoot $entry.Key
    if (-not (Test-Path $source)) {
        Write-Warning "Missing: $source"
        continue
    }
    foreach ($dest in $destDirs) {
        Copy-Item -Path $source -Destination (Join-Path $dest $entry.Value) -Force
    }
}

# Default placeholder
$defaultSrc = Join-Path $srcRoot "trasua\trasuatruyenthong.jpg"
if (Test-Path $defaultSrc) {
    foreach ($dest in $destDirs) {
        Copy-Item $defaultSrc (Join-Path $dest "default.jpg") -Force
    }
}

Write-Host "Synced $($map.Count) product images."
