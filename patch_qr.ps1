Add-Type -AssemblyName System.Drawing

function Superimpose-QR($baseImgPath, $qrImgPath, $outputPath, $targetRect) {
    $baseBmp = [System.Drawing.Image]::FromFile($baseImgPath)
    $qrBmp = [System.Drawing.Image]::FromFile($qrImgPath)
    
    $canvas = New-Object System.Drawing.Bitmap($baseBmp.Width, $baseBmp.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Draw base
    $graphics.DrawImage($baseBmp, 0, 0, $baseBmp.Width, $baseBmp.Height)

    # Draw rounded white background plate behind QR for ultra contrast and guaranteed readability
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $pad = 12
    $plateRect = New-Object System.Drawing.Rectangle($targetRect.X - $pad, $targetRect.Y - $pad, $targetRect.Width + ($pad*2), $targetRect.Height + ($pad*2))
    $graphics.FillRectangle($whiteBrush, $plateRect)

    # Draw exact QR code
    $graphics.DrawImage($qrBmp, $targetRect)

    $graphics.Dispose()
    $baseBmp.Dispose()
    $qrBmp.Dispose()

    # Save output JPEG with high quality
    $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $canvas.Dispose()
}

$qr = "c:\Users\Sylvester\Documents\Project\telepromter-gbemisly\public\real_qr.png"

# 1. Multi Device (1920x1080 approx, QR is centered at ~ 800, 300 with width ~360)
$img1 = "c:\Users\Sylvester\Documents\Project\telepromter-gbemisly\public\ad-multi-device.jpg"
$bmp1 = [System.Drawing.Image]::FromFile($img1)
$w1 = $bmp1.Width
$h1 = $bmp1.Height
$bmp1.Dispose()
# Place QR in the center-top card position
$rect1 = New-Object System.Drawing.Rectangle([int]($w1 * 0.407), [int]($h1 * 0.285), [int]($w1 * 0.175), [int]($w1 * 0.175))
Superimpose-QR $img1 $qr "c:\Users\Sylvester\Documents\Project\telepromter-gbemisly\public\ad-multi-device.jpg" $rect1

# 2. Square Social (1024x1024 approx, QR is at right side ~ 800, 420)
$img2 = "c:\Users\Sylvester\Documents\Project\telepromter-gbemisly\public\ad-social-square.jpg"
$bmp2 = [System.Drawing.Image]::FromFile($img2)
$w2 = $bmp2.Width
$h2 = $bmp2.Height
$bmp2.Dispose()
# Place QR cleanly on the right side over the AI QR block
$rect2 = New-Object System.Drawing.Rectangle([int]($w2 * 0.772), [int]($h2 * 0.415), [int]($w2 * 0.170), [int]($w2 * 0.170))
Superimpose-QR $img2 $qr "c:\Users\Sylvester\Documents\Project\telepromter-gbemisly\public\ad-social-square.jpg" $rect2

# 3. Tablet Desktop (approx 4:3, QR is center-bottom ~ 400, 600)
$img3 = "c:\Users\Sylvester\Documents\Project\telepromter-gbemisly\public\ad-tablet-desktop.jpg"
$bmp3 = [System.Drawing.Image]::FromFile($img3)
$w3 = $bmp3.Width
$h3 = $bmp3.Height
$bmp3.Dispose()
$rect3 = New-Object System.Drawing.Rectangle([int]($w3 * 0.405), [int]($h3 * 0.605), [int]($w3 * 0.190), [int]($w3 * 0.190))
Superimpose-QR $img3 $qr "c:\Users\Sylvester\Documents\Project\telepromter-gbemisly\public\ad-tablet-desktop.jpg" $rect3

Write-Host "Real Scannable QR Codes injected into all 3 images successfully!"
