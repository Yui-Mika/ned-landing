// Teddy's lines. He is decorative (aria-hidden): no information lives only in him,
// and he never offers help or advice.
export type Mood = 'waving' | 'thinking' | 'surprised' | 'sleepy' | 'curious' | 'happy' | 'proud';

export const teddyBubbles: Partial<Record<Mood, string>> = {
  waving: "Hi, I'm Teddy.",
  thinking: '…',
  sleepy: 'zzz',
};
