import { fmt, tierFor } from '../crypto';
import { DecryptedStudentResult, EncryptedDataset } from '../types';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function downloadResultCard(
  student: DecryptedStudentResult,
  dataset: EncryptedDataset
): Promise<void> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // fallback
    }
  }

  const total = student.total || dataset.meta.total;
  const pct = total ? (student.score / total) * 100 : 0;
  const tier = tierFor(pct);

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#060b1c');
  bg.addColorStop(0.55, '#0a122e');
  bg.addColorStop(1, '#180c35');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial Auras
  const r1 = ctx.createRadialGradient(W - 100, 100, 10, W - 100, 100, 780);
  r1.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
  r1.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = r1;
  ctx.fillRect(0, 0, W, H);

  const r2 = ctx.createRadialGradient(100, 200, 10, 100, 200, 720);
  r2.addColorStop(0, 'rgba(0, 180, 255, 0.35)');
  r2.addColorStop(1, 'rgba(0, 180, 255, 0)');
  ctx.fillStyle = r2;
  ctx.fillRect(0, 0, W, H);

  // Circuit Grid lines in background
  ctx.strokeStyle = 'rgba(0, 180, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 60; x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 60; y < H; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Outer Border Frame
  ctx.strokeStyle = 'rgba(61, 232, 255, 0.4)';
  ctx.lineWidth = 3;
  roundRect(ctx, 40, 40, W - 80, H - 80, 36);
  ctx.stroke();

  // Corner Accent Marks
  ctx.strokeStyle = '#e8b84a';
  ctx.lineWidth = 5;
  // Top left
  ctx.beginPath();
  ctx.moveTo(40, 90);
  ctx.lineTo(40, 40);
  ctx.lineTo(90, 40);
  ctx.stroke();
  // Top right
  ctx.beginPath();
  ctx.moveTo(W - 90, 40);
  ctx.lineTo(W - 40, 40);
  ctx.lineTo(W - 40, 90);
  ctx.stroke();
  // Bottom left
  ctx.beginPath();
  ctx.moveTo(40, H - 90);
  ctx.lineTo(40, H - 40);
  ctx.lineTo(90, H - 40);
  ctx.stroke();
  // Bottom right
  ctx.beginPath();
  ctx.moveTo(W - 90, H - 40);
  ctx.lineTo(W - 40, H - 40);
  ctx.lineTo(W - 40, H - 90);
  ctx.stroke();

  // Single KNOWVIA Medallion Logo
  const logoX = W / 2;
  const logoY = 120;
  const logoR = 52;
  const goldGrad = ctx.createLinearGradient(logoX - logoR, logoY - logoR, logoX + logoR, logoY + logoR);
  goldGrad.addColorStop(0, '#fff2be');
  goldGrad.addColorStop(0.3, '#e8b84a');
  goldGrad.addColorStop(0.7, '#8d6415');
  goldGrad.addColorStop(1, '#ffd875');
  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#060b18';
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoR - 4, 0, Math.PI * 2);
  ctx.fill();

  const centerGrad = ctx.createRadialGradient(logoX, logoY, 5, logoX, logoY, logoR - 15);
  centerGrad.addColorStop(0, '#15244e');
  centerGrad.addColorStop(1, '#050a18');
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoR - 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3de8ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Play icon in center
  ctx.fillStyle = '#3de8ff';
  ctx.beginPath();
  ctx.moveTo(logoX - 5, logoY - 7);
  ctx.lineTo(logoX + 7, logoY);
  ctx.lineTo(logoX - 5, logoY + 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 12px "Poppins", sans-serif';
  ctx.fillText('KNOWVIA', logoX, logoY - 24);
  ctx.font = '700 8.5px "Poppins", sans-serif';
  ctx.fillText('QUIZ CLUB', logoX, logoY + 32);

  // Club & University Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#3de8ff';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText('KNOWVIA · THE QUIZ CLUB OF CSE', W / 2, 202);

  ctx.fillStyle = '#8e9fc6';
  ctx.font = '500 18px "DM Sans", sans-serif';
  ctx.fillText('Institute of Engineering & Technology · RMLAU Ayodhya', W / 2, 230);

  // Divider
  ctx.strokeStyle = 'rgba(232, 184, 74, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 180, 252);
  ctx.lineTo(W / 2 + 180, 252);
  ctx.stroke();

  // MindBytes Title
  ctx.font = 'italic 800 78px "Poppins", sans-serif';
  const mindWidth = ctx.measureText('Mind').width;
  const bytesWidth = ctx.measureText('Bytes').width;
  const totalLogoW = mindWidth + bytesWidth;
  const startX = W / 2 - totalLogoW / 2;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Mind', startX, 330);
  ctx.fillStyle = '#00b4ff';
  ctx.fillText('Bytes', startX + mindWidth, 330);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd875';
  ctx.font = '700 20px "Poppins", sans-serif';
  ctx.fillText('THE AI QUIZ · OFFICIAL RESULT CARD', W / 2, 372);

  // Student Info Box
  roundRect(ctx, 100, 410, W - 200, 160, 24);
  ctx.fillStyle = 'rgba(4, 12, 32, 0.7)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(110, 165, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#3de8ff';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText('CANDIDATE DOSSIER', W / 2, 428);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 50px "Poppins", sans-serif';
  let displayName = student.name;
  while (ctx.measureText(displayName).width > W - 260 && displayName.length > 3) {
    displayName = displayName.slice(0, -1);
  }
  if (displayName !== student.name) displayName += '…';
  ctx.fillText(displayName, W / 2, 490);

  ctx.fillStyle = '#8e9fc6';
  ctx.font = '600 24px "DM Sans", sans-serif';
  const metaText = [student.branch, student.year].filter(Boolean).join('  ·  ');
  ctx.fillText(metaText || student.branch, W / 2, 532);

  // Score Highlight Circle
  const scoreGrad = ctx.createLinearGradient(W / 2 - 200, 600, W / 2 + 200, 800);
  scoreGrad.addColorStop(0, '#3de8ff');
  scoreGrad.addColorStop(0.5, '#00b4ff');
  scoreGrad.addColorStop(1, '#8b5cf6');

  ctx.fillStyle = scoreGrad;
  ctx.font = '800 200px "Poppins", sans-serif';
  ctx.fillText(fmt(student.score), W / 2, 770);

  ctx.fillStyle = '#8e9fc6';
  ctx.font = '600 36px "Poppins", sans-serif';
  ctx.fillText(`out of ${fmt(total)} marks  ·  ${pct.toFixed(1)}%`, W / 2, 835);

  // Badges / Metrics
  const drawPill = (txt: string, y: number, isGold = false) => {
    ctx.font = '700 28px "Poppins", sans-serif';
    const textW = ctx.measureText(txt).width;
    const pillW = textW + 80;
    const pillH = 64;

    roundRect(ctx, W / 2 - pillW / 2, y - 44, pillW, pillH, 32);
    ctx.fillStyle = isGold ? 'rgba(232, 184, 74, 0.18)' : 'rgba(0, 180, 255, 0.14)';
    ctx.fill();
    ctx.strokeStyle = isGold ? 'rgba(232, 184, 74, 0.7)' : 'rgba(61, 232, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = isGold ? '#ffd875' : '#ffffff';
    ctx.fillText(txt, W / 2, y + 2);
  };

  drawPill(`Overall Rank #${student.rank} of ${dataset.meta.participants}`, 935);
  drawPill(`${tier.icon}  ${tier.name}`, 1025, pct >= 75);

  // Performance Remark
  ctx.fillStyle = '#b0c4eb';
  ctx.font = 'italic 500 22px "DM Sans", sans-serif';
  let remarkText = student.remarks || tier.msg;
  if (ctx.measureText(remarkText).width > W - 180) {
    remarkText = `"${remarkText.slice(0, 65)}…"`;
  } else {
    remarkText = `"${remarkText}"`;
  }
  ctx.fillText(remarkText, W / 2, 1120);

  // Footer Tagline
  ctx.strokeStyle = 'rgba(110, 165, 255, 0.2)';
  ctx.beginPath();
  ctx.moveTo(120, 1180);
  ctx.lineTo(W - 120, 1180);
  ctx.stroke();

  ctx.fillStyle = '#3de8ff';
  ctx.font = 'italic 700 30px "Poppins", sans-serif';
  ctx.fillText('Think. Decode. Discover.', W / 2, 1230);

  ctx.fillStyle = '#8e9fc6';
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillText(`VERIFIED CRYPTOGRAPHIC RESULT · ID #${student.rank}`, W / 2, 1270);

  // Convert to image and trigger download
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MindBytes_Result_${student.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve();
      }, 3000);
    }, 'image/png');
  });
}
