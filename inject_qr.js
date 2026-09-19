import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';

async function patchImages() {
  const url = 'https://debzane-concept-teleprompter.pages.dev';
  
  // Generate high quality QR code buffer
  const qrBuffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 600,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  const qrImage = await loadImage(qrBuffer);

  // 1. Multi Device Image
  const img1Path = path.resolve('./public/ad-multi-device.jpg');
  if (fs.existsSync(img1Path)) {
    const base1 = await loadImage(img1Path);
    const canvas1 = createCanvas(base1.width, base1.height);
    const ctx1 = canvas1.getContext('2d');
    ctx1.drawImage(base1, 0, 0);

    const qrW = Math.round(base1.width * 0.176);
    const qrH = qrW;
    const qrX = Math.round(base1.width * 0.407);
    const qrY = Math.round(base1.height * 0.282);

    // Draw solid white backdrop plate for guaranteed contrast
    ctx1.fillStyle = '#ffffff';
    ctx1.fillRect(qrX - 6, qrY - 6, qrW + 12, qrH + 12);
    ctx1.drawImage(qrImage, qrX, qrY, qrW, qrH);

    fs.writeFileSync(img1Path, canvas1.toBuffer('image/jpeg', { quality: 0.95 }));
    console.log('Patched ad-multi-device.jpg with real scannable QR code!');
  }

  // 2. Square Social Image
  const img2Path = path.resolve('./public/ad-social-square.jpg');
  if (fs.existsSync(img2Path)) {
    const base2 = await loadImage(img2Path);
    const canvas2 = createCanvas(base2.width, base2.height);
    const ctx2 = canvas2.getContext('2d');
    ctx2.drawImage(base2, 0, 0);

    // Top Right QR code
    const qrW1 = Math.round(base2.width * 0.175);
    const qrH1 = qrW1;
    const qrX1 = Math.round(base2.width * 0.772);
    const qrY1 = Math.round(base2.height * 0.415);
    ctx2.fillStyle = '#ffffff';
    ctx2.fillRect(qrX1 - 4, qrY1 - 4, qrW1 + 8, qrH1 + 8);
    ctx2.drawImage(qrImage, qrX1, qrY1, qrW1, qrH1);

    // Bottom Right QR code
    const qrW2 = Math.round(base2.width * 0.160);
    const qrH2 = qrW2;
    const qrX2 = Math.round(base2.width * 0.785);
    const qrY2 = Math.round(base2.height * 0.795);
    ctx2.fillStyle = '#ffffff';
    ctx2.fillRect(qrX2 - 4, qrY2 - 4, qrW2 + 8, qrH2 + 8);
    ctx2.drawImage(qrImage, qrX2, qrY2, qrW2, qrH2);

    fs.writeFileSync(img2Path, canvas2.toBuffer('image/jpeg', { quality: 0.95 }));
    console.log('Patched ad-social-square.jpg with real scannable QR code!');
  }

  // 3. Tablet Desktop Image
  const img3Path = path.resolve('./public/ad-tablet-desktop.jpg');
  if (fs.existsSync(img3Path)) {
    const base3 = await loadImage(img3Path);
    const canvas3 = createCanvas(base3.width, base3.height);
    const ctx3 = canvas3.getContext('2d');
    ctx3.drawImage(base3, 0, 0);

    const qrW3 = Math.round(base3.width * 0.198);
    const qrH3 = qrW3;
    const qrX3 = Math.round(base3.width * 0.401);
    const qrY3 = Math.round(base3.height * 0.605);

    ctx3.fillStyle = '#ffffff';
    ctx3.fillRect(qrX3 - 6, qrY3 - 6, qrW3 + 12, qrH3 + 12);
    ctx3.drawImage(qrImage, qrX3, qrY3, qrW3, qrH3);

    fs.writeFileSync(img3Path, canvas3.toBuffer('image/jpeg', { quality: 0.95 }));
    console.log('Patched ad-tablet-desktop.jpg with real scannable QR code!');
  }
}

patchImages().catch(console.error);
