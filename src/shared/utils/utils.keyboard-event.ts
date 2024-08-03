// If code is in format 'Digit{x}' returns x.
export const parseDigitCode = (event: KeyboardEvent): number =>
	Number(event.code.split('Digit')[1]);
