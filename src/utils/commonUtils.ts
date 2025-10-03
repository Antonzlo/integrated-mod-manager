import type { Settings } from './types';

/**
 * Handles image loading errors by setting a fallback source.
 * @param event - The image error event
 * @param fallbackSrc - The fallback image source to use
 * @param hideOnError - If true, hides the image on error by setting opacity to 0
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string,
  hideOnError = false
): void {
  const target = event.currentTarget;
  if (hideOnError) {
    target.style.opacity = '0';
  }
  target.src = fallbackSrc;
}

/**
 * Handles mouse up events on cards, supporting different mouse buttons for toggle and select actions.
 * @param event - The mouse event
 * @param settings - Application settings containing the toggle button configuration
 * @param onToggle - Optional callback function for toggle action
 * @param onSelect - Optional callback function for select action (left click)
 */
export function handleCardMouseUp(
  event: React.MouseEvent,
  settings: Settings,
  onToggle?: () => void,
  onSelect?: () => void,
): void {
  event.preventDefault();
  if (event.button === settings.toggle && onToggle) {
    onToggle();
  } else if (event.button === 0 && onSelect) {
    onSelect();
  }
}
/**
 * Prevents the context menu from appearing.
 * @param event - The mouse event to prevent
 */
export function preventContextMenu(event: React.MouseEvent): void {
  event.preventDefault();
}

/**
 * Removes the 'DISABLED_' prefix from a mod name.
 * @param name - The mod name to format
 * @returns The formatted name without the disabled prefix
 */
export function formatModName(name: string): string {
  return name.replaceAll('DISABLED_', '');
}

/**
 * Toggles the 'DISABLED_' prefix on a mod name based on its enabled state.
 * @param currentName - The current mod name
 * @param enabled - Whether the mod is currently enabled
 * @returns The toggled name (adds DISABLED_ if enabled, removes it if disabled)
 */
export function toggleModName(currentName: string, enabled: boolean): string {
  const baseName = formatModName(currentName);
  return enabled ? `DISABLED_${baseName}` : baseName;
}
export function buildPreviewUrl(
  baseUri: string,
  root: string,
  path: string,
  timestamp: number
): string {
  return `${baseUri}${root}${path}?${timestamp}`;
}
export const transparentInputStyle: React.CSSProperties = {
  backgroundColor: '#fff0'
};
export const cardInputStyle: React.CSSProperties = {
  backgroundColor: '#fff0'
};
export function formatTimeFromNow(timestamp: number, now: number): string {
  const diff = Math.abs(now - timestamp);
  const secInMinute = 60;
  const secInHour = secInMinute * 60;
  const secInDay = secInHour * 24;
  const secInYear = secInDay * 365;
  if (diff < secInMinute) {
    return 'now';
  } else if (diff < secInHour) {
    const minutes = Math.floor(diff / secInMinute);
    return `${minutes}m`;
  } else if (diff < secInDay) {
    const hours = Math.floor(diff / secInHour);
    return `${hours}h`;
  } else if (diff < secInYear) {
    const days = Math.floor(diff / secInDay);
    return `${days}d`;
  } else {
    const years = Math.floor(diff / secInYear);
    return `${years}y`;
  }
}
export const cardGridStyle: React.CSSProperties = {
  gridTemplateColumns: 'repeat(auto-fill, minmax(256px, 256px))',
  gridAutoRows: '288px',
  columnGap: '0px',
  rowGap: '32px',
  justifyItems: 'center'
};
export function getCardClasses(isSelected = false, additionalClasses = ''): string {
  const baseClasses = 'w-56 h-72 cursor-pointer hover:outline-accent outline-offset-7 outline-accent/0 hover:scale-105 active:scale-95 select-none bg-card rounded-lg border duration-200 outline overflow-hidden';
  const selectedClass = isSelected ? ' selectedCard' : '';
  return `${baseClasses}${selectedClass} ${additionalClasses}`.trim();
}
export const commonMotionConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};
export function isDirectClick(event: React.MouseEvent): boolean {
  return event.target === event.currentTarget;
}