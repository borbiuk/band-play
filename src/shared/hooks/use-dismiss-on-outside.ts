import { RefObject, useEffect, useRef } from 'react';

/** Why a popup closes. */
export type DismissReason = 'outside' | 'escape';

/**
 * While `isOpen`, calls `onDismiss` when the mouse goes down outside of `ref` or Escape is pressed.
 *
 * @param ref - The element of the popup; a press inside it does not dismiss.
 * @param isOpen - Whether the popup is open; nothing is listened to while it is closed.
 * @param onDismiss - Called with the reason; it should close the popup.
 */
export const useDismissOnOutside = (
	ref: RefObject<HTMLElement | null>,
	isOpen: boolean,
	onDismiss: (reason: DismissReason) => void
): void => {
	// The listeners are added once per opening, and still call the latest callback
	const onDismissRef = useRef(onDismiss);
	onDismissRef.current = onDismiss;

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const onMouseDown = (event: MouseEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				onDismissRef.current('outside');
			}
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onDismissRef.current('escape');
			}
		};

		document.addEventListener('mousedown', onMouseDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('mousedown', onMouseDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [ref, isOpen]);
};
