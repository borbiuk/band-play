export const setSafeInterval: (
	callback: () => void,
	delay?: number
) => NodeJS.Timeout = (callback: () => void, delay?: number) => {
	return setInterval(() => {
		try {
			callback();
		} catch (error) {
			console.error(error);
		}
	}, delay);
};
