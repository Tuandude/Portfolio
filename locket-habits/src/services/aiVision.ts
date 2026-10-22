/**
 * AI Vision Verifier (simulated).
 *
 * Analyses the habit context string and "detects" matching keywords in it to return
 * a comic-style verdict and a fun comment.  In production this would call a real
 * vision API (e.g. OpenAI GPT-4o vision endpoint), but the simulation runs fully
 * offline to avoid network dependencies.
 */

export interface AIVerifyResult {
  verified: boolean;
  confidence: number; // 0-100
  comment: string;
  stamp: 'verified' | 'suspicious' | 'failed';
}

interface HabitPattern {
  /** Keywords to look for in the habit title (case-insensitive) */
  keywords: string[];
  verifiedComments: string[];
  suspiciousComments: string[];
}

const HABIT_PATTERNS: HabitPattern[] = [
  {
    keywords: ['nước', 'water', 'uống', 'hydrat'],
    verifiedComments: [
      'Thấy ly nước rồi nhé, chuẩn 100 điểm! 💧',
      'Xịn! Nước là nguồn sống, bạn trẻ đang làm đúng hướng! 🌊',
      'H2O detected! AI thấy bạn đang hydrat hóa rất chuyên nghiệp!',
    ],
    suspiciousComments: [
      'Hmm... AI thấy có gì đó nhưng không chắc có ly nước không... 🤔',
      'Bức ảnh hơi mờ, nhưng AI tin tưởng bạn!',
    ],
  },
  {
    keywords: ['gym', 'tập', 'chạy', 'run', 'fitness', 'thể dục', 'workout', 'yoga'],
    verifiedComments: [
      'Thần tượng giới thể thao đây rồi! Flex cơ bắp đi! 💪',
      'AI phát hiện mồ hôi công lực! Xịn sò quá đi! 🔥',
      'Chuẩn bạch tuộc gym! Cơ thể không biết nói dối đâu nhé!',
    ],
    suspiciousComments: [
      'Có vẻ là đang tập luyện, nhưng AI chưa thấy đủ mồ hôi... 😅',
    ],
  },
  {
    keywords: ['sách', 'đọc', 'book', 'read', 'học'],
    verifiedComments: [
      'Ôi sách kìa! Não đang được nâng cấp lên level mới! 📚',
      'Tri thức detected! AI xác nhận bạn đang là người khôn nhất phòng!',
      'Đọc sách là siêu năng lực, và bạn đang dùng nó! Tuyệt vời! 🦸',
    ],
    suspiciousComments: [
      'AI nghi có sách ở đây, nhưng không chắc bạn đang đọc hay để làm gối... 😆',
    ],
  },
  {
    keywords: ['thiền', 'meditat', 'mind', 'breathe', 'hít thở', 'relax'],
    verifiedComments: [
      'Aura của bạn đang tỏa sáng! AI cảm nhận được sự bình yên! 🧘',
      'Zen master detected! Năng lượng trong ảnh cực kỳ thanh thản!',
    ],
    suspiciousComments: [
      'AI không chắc bạn đang thiền hay đang ngủ... nhưng cả hai đều tốt! 😴',
    ],
  },
  {
    keywords: ['ăn', 'salad', 'healthy', 'rau', 'trái cây', 'food', 'matcha', 'smoothie'],
    verifiedComments: [
      'Clean eating detected! Bụng bạn đang cảm ơn rất nhiều! 🥗',
      'Wow, màu xanh của rau củ chiếu sáng cả bức ảnh! Đỉnh của chóp!',
      'AI xác nhận: bạn đang ăn uống lành mạnh hơn 99% dân số!',
    ],
    suspiciousComments: [
      'Hmm, AI thấy đồ ăn nhưng không chắc có healthy không... Khai thật đi! 😄',
    ],
  },
];

const GENERIC_VERIFIED_COMMENTS = [
  'AI không nhận ra cụ thể nhưng bức ảnh tỏa ra năng lượng tích cực! Tin tưởng tuyệt đối! ⚡',
  'Verified bằng cảm xúc! AI thấy commitment trong đôi mắt bạn qua màn hình! 🔥',
  'Không biết làm gì nhưng AI biết bạn đang làm đúng! Cứ tiếp tục nhé! 🚀',
];

const GENERIC_SUSPICIOUS_COMMENTS = [
  'AI đang phân tích... kết quả: 70% khả năng bạn đang cố gắng, 30% ăn gian! 😂',
  'Hmm, bức ảnh hơi... nghệ thuật. AI xác nhận nhưng với 1 con mắt nhắm lại!',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Simulate AI vision analysis.  In production, replace this with an actual API call
 * that sends `imageDataUrl` and `habitTitle` to a vision model.
 */
export function analyzeHabitPhoto(habitTitle: string): AIVerifyResult {
  const lower = habitTitle.toLowerCase();

  for (const pattern of HABIT_PATTERNS) {
    const matched = pattern.keywords.some((kw) => lower.includes(kw));
    if (matched) {
      // Simulate 80% verified, 20% suspicious
      const roll = Math.random();
      if (roll < 0.80) {
        return {
          verified: true,
          confidence: 80 + Math.floor(Math.random() * 20),
          comment: pickRandom(pattern.verifiedComments),
          stamp: 'verified',
        };
      }
      return {
        verified: true,
        confidence: 55 + Math.floor(Math.random() * 20),
        comment: pickRandom(pattern.suspiciousComments),
        stamp: 'suspicious',
      };
    }
  }

  // No matching pattern found — still give a positive generic result
  const roll = Math.random();
  if (roll < 0.75) {
    return {
      verified: true,
      confidence: 70 + Math.floor(Math.random() * 25),
      comment: pickRandom(GENERIC_VERIFIED_COMMENTS),
      stamp: 'verified',
    };
  }
  return {
    verified: true,
    confidence: 50 + Math.floor(Math.random() * 20),
    comment: pickRandom(GENERIC_SUSPICIOUS_COMMENTS),
    stamp: 'suspicious',
  };
}

/**
 * Render an "AI VERIFIED" comic stamp onto a canvas context.
 * Call this after drawing the base image and before calling `canvas.toDataURL`.
 *
 * @param ctx - 2D rendering context of the target canvas
 * @param canvasSize - side length of the square canvas in pixels
 * @param result - the AI analysis result to display
 */
export function renderAIStamp(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  result: AIVerifyResult
): void {
  const stampX = canvasSize - 20;
  const stampY = 20;
  const radius = 72;

  ctx.save();
  ctx.translate(stampX - radius, stampY + radius);
  ctx.rotate(-0.35); // tilt counter-clockwise ~20°

  // Outer ring (thick comic border)
  const ringColor = result.stamp === 'verified' ? '#52B788' : '#FFD166';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = ringColor;
  ctx.fill();

  // Black border ring
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Inner white circle
  ctx.beginPath();
  ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner dashed ring
  ctx.beginPath();
  ctx.arc(0, 0, radius - 16, 0, Math.PI * 2);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Main stamp text
  ctx.fillStyle = '#18181B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 14px system-ui, sans-serif';
  ctx.fillText('AI', 0, -28);

  ctx.font = '900 16px system-ui, sans-serif';
  ctx.fillText('VERIFIED', 0, -10);

  // Check mark or hourglass
  ctx.font = '900 22px system-ui, sans-serif';
  ctx.fillText(result.stamp === 'verified' ? '✓' : '~', 0, 12);

  // Confidence %
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText(`${result.confidence}%`, 0, 30);

  ctx.restore();
}
