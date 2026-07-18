// Short, positive, varied by how the check-in went. Never clinical, never
// guilt-tripping about low scores — just a warm acknowledgment.
const LOW_MESSAGES = [
  'Thanks for checking in — that matters.',
  'Noted, gently. Glad you took a moment for this.',
  'Thank you for being honest with yourself.',
];

const MID_MESSAGES = [
  'Logged. Nice work checking in.',
  'Thanks for showing up for yourself today.',
  'Noted — appreciate you taking the moment.',
];

const HIGH_MESSAGES = [
  'Love that. Thanks for sharing!',
  'Great to hear — keep it up.',
  'Wonderful. Thanks for checking in!',
];

export function getThankYouMessage(score: number): string {
  const pool = score <= 3 ? LOW_MESSAGES : score <= 7 ? MID_MESSAGES : HIGH_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}
