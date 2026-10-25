/**
 * Frosted glass surface for bars that content scrolls under (popup header and footer, downloads header).
 * Falls back to an almost opaque white where backdrop-filter is missing.
 */
export const glass =
	'bg-white/[.72] backdrop-blur-[18px] backdrop-saturate-150 supports-[not(backdrop-filter:blur(1px))]:bg-white/95';
