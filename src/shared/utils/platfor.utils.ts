/**
 * Checks if the current platform is macOS.
 *
 * @returns True if running on macOS, false otherwise
 */
export const isMac = () => navigator.platform.toLowerCase().includes('mac');
