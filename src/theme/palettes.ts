// Soft, calm, abstract palettes — no literal mood/emotion iconography.
// Every palette provides the same keys so the rest of the app never has to
// know which one is active; only the values differ.
export interface Palette {
  id: 'meadow' | 'ocean' | 'dusk';
  name: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;

  ink: string;
  inkMuted: string;
  inkFaint: string;

  sage: string;
  sageDark: string;
  sageMuted: string;

  clay: string;
  lavender: string;

  // Low-to-high score gradient stops, kept desaturated and abstract.
  scoreLow: string;
  scoreMid: string;
  scoreHigh: string;

  danger: string;
  white: string;

  // Each tab gets its own accent, drawn from the same palette so switching
  // palettes keeps the three tabs visually distinct but still coherent.
  accents: {
    checkIn: string;
    history: string;
    settings: string;
  };
}

const meadow: Palette = {
  id: 'meadow',
  name: 'Meadow',
  background: '#F7F2E9',
  surface: '#FFFFFF',
  surfaceMuted: '#EFE8D9',
  border: '#E5DCC8',

  ink: '#3A362E',
  inkMuted: '#8C8474',
  inkFaint: '#B5AC9A',

  sage: '#8BA087',
  sageDark: '#657A63',
  sageMuted: '#DCE5D8',

  clay: '#C98C71',
  lavender: '#A79BC4',

  scoreLow: '#9AA9C9',
  scoreMid: '#B7A98E',
  scoreHigh: '#B98A63',

  danger: '#C4665A',
  white: '#FFFFFF',

  accents: {
    checkIn: '#657A63',
    history: '#B9784F',
    settings: '#8570A6',
  },
};

const ocean: Palette = {
  id: 'ocean',
  name: 'Ocean',
  background: '#EEF3F8',
  surface: '#FFFFFF',
  surfaceMuted: '#DCE6F0',
  border: '#C7D7E6',

  ink: '#26333F',
  inkMuted: '#6C8194',
  inkFaint: '#A2B4C4',

  sage: '#7FA0A6',
  sageDark: '#557880',
  sageMuted: '#DAE6E7',

  clay: '#4F7BA6',
  lavender: '#7B93C4',

  scoreLow: '#8FA9C0',
  scoreMid: '#6E93B8',
  scoreHigh: '#3E6E92',

  danger: '#C15C56',
  white: '#FFFFFF',

  accents: {
    checkIn: '#3E6E92',
    history: '#5B87A6',
    settings: '#6C6FA6',
  },
};

const dusk: Palette = {
  id: 'dusk',
  name: 'Dusk',
  background: '#F3F0F6',
  surface: '#FFFFFF',
  surfaceMuted: '#E8E2EF',
  border: '#D9D0E4',

  ink: '#332E3D',
  inkMuted: '#847C93',
  inkFaint: '#B7AFC4',

  sage: '#84A184',
  sageDark: '#5F8060',
  sageMuted: '#DEE7DA',

  clay: '#C48A6E',
  lavender: '#8571A6',

  scoreLow: '#8FA0C7',
  scoreMid: '#A896BE',
  scoreHigh: '#C08A6E',

  danger: '#B1584F',
  white: '#FFFFFF',

  accents: {
    checkIn: '#6C5990',
    history: '#B4785C',
    settings: '#5E8B6E',
  },
};

export const palettes: Palette[] = [meadow, ocean, dusk];
export const defaultPalette = meadow;

export function getPaletteById(id: string | null | undefined): Palette {
  return palettes.find((p) => p.id === id) ?? defaultPalette;
}
