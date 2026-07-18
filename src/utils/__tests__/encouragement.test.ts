import { getThankYouMessage } from '../encouragement';

describe('getThankYouMessage', () => {
  it('always returns a non-empty string for any valid score', () => {
    for (let score = 1; score <= 10; score++) {
      const message = getThankYouMessage(score);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    }
  });

  it('varies the message across repeated calls for the same score', () => {
    const messages = new Set(Array.from({ length: 30 }, () => getThankYouMessage(5)));
    expect(messages.size).toBeGreaterThan(1);
  });
});
