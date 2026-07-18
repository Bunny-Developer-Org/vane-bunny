import { average, median, roundToOneDecimal } from '../stats';

describe('average', () => {
  it('returns 0 for an empty list', () => {
    expect(average([])).toBe(0);
  });

  it('returns the value itself for a single score', () => {
    expect(average([7])).toBe(7);
  });

  it('averages multiple scores', () => {
    expect(average([2, 4, 9])).toBeCloseTo(5);
  });

  it('handles a 0 score correctly, not as missing', () => {
    expect(average([0, 10])).toBe(5);
  });
});

describe('median', () => {
  it('returns 0 for an empty list', () => {
    expect(median([])).toBe(0);
  });

  it('returns the value itself for a single score', () => {
    expect(median([7])).toBe(7);
  });

  it('averages the two middle values for an even-length list', () => {
    expect(median([1, 3, 4, 9])).toBe(3.5);
  });

  it('returns the middle value for an odd-length list', () => {
    expect(median([9, 1, 5])).toBe(5);
  });

  it('does not mutate the input array', () => {
    const scores = [3, 1, 2];
    median(scores);
    expect(scores).toEqual([3, 1, 2]);
  });
});

describe('roundToOneDecimal', () => {
  it('rounds to one decimal place', () => {
    expect(roundToOneDecimal(5.55)).toBeCloseTo(5.6);
    expect(roundToOneDecimal(5.44)).toBeCloseTo(5.4);
  });

  it('leaves whole numbers unchanged', () => {
    expect(roundToOneDecimal(6)).toBe(6);
  });
});
