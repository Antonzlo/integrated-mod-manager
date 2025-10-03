export const VERSION = "2.0.0";
export const CSS_CLASSES = {
  
  CARD_BASE: 'w-56 h-72 hover:outline-accent outline-offset-7 outline-accent/0 hover:scale-105 active:scale-95 select-none bg-card rounded-lg border duration-200 outline overflow-hidden',
  CARD_SELECTED: 'selectedCard',
  CARD_ACTIVE: 'activeCard',
  
  
  INPUT_TRANSPARENT: 'w-56 pointer-events-none select-none overflow-hidden border-0 text-ellipsis',
  INPUT_CARD: 'w-56 cursor-pointer select-none focus-within:select-auto overflow-hidden h-8 focus-visible:ring-[0px] border-0 text-ellipsis',
  
  
  FADE_IN: 'fade-in',
  GRID_AUTO_FILL: 'grid justify-center w-full h-full py-4',
  
  
  BG_BACKDROP: 'bg-background/50 backdrop-blur',
  BG_TRANSPARENT: 'bg-background/50',
} as const;
export const COMMON_STYLES = {
  TRANSPARENT_BG: { backgroundColor: '#fff0' },
  HIDDEN_OPACITY: { opacity: '0' },
  FULL_OPACITY: { opacity: '1' },
  
  
  CARD_GRID: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(256px, 256px))',
    gridAutoRows: '288px',
    columnGap: '0px',
    rowGap: '32px',
    justifyItems: 'center' as const,
  },
} as const;
export const ANIMATIONS = {
  FADE: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  SCALE: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 },
  },
} as const;
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;
export const FS = {
  DISABLED_PREFIX: 'DISABLED_',
  SEPARATOR: '/',
  BACKUP_SUFFIX: '_backup',
} as const;
export const UI = {
  CARD_WIDTH: 256,
  CARD_HEIGHT: 288,
  SIDEBAR_COLLAPSED_WIDTH: '3rem',
  DEFAULT_THUMBNAIL: '/default-thumbnail.png',
} as const;
export const PRIORITY_KEYS = ['Alt', 'Ctrl', 'Shift', 'Capslock', 'Tab', 'Up', 'Down', 'Left', 'Right'] as const;
export const MOUSE_BUTTONS = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
} as const;
export const TRANSITIONS = {
  ONLINE_DELAY: '0.3s',
  OFFLINE_DELAY: '0s',
  DEFAULT_DURATION: 0.3,
} as const;