// Drug element.
export const drugElement = (
	element: Element,
	fromX: number,
	fromY: number,
	toX: number,
	toY: number
): void => {
	const down = new MouseEvent('mousedown', {
		bubbles: true,
		cancelable: true,
		view: window,
		clientX: fromX,
		clientY: fromY,
	});

	const move = new MouseEvent('mousemove', {
		bubbles: true,
		cancelable: true,
		view: window,
		clientX: toX,
		clientY: toY,
	});

	const up = new MouseEvent('mouseup', {
		bubbles: true,
		cancelable: true,
		view: window,
		clientX: toX,
		clientY: toY,
	});

	element.dispatchEvent(down);
	element.dispatchEvent(move);
	element.dispatchEvent(up);
};
