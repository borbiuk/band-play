/**
 * Options for `createRoot`: React removes the whole tree after an uncaught render error,
 * so a short message is shown instead of a blank page.
 *
 * @param container - The root element of the page
 * @param pageName - Name of the page for the log, such as "settings"
 */
export const renderErrorOptions = (
	container: HTMLElement,
	pageName: string
) => ({
	onUncaughtError: (error: unknown) => {
		console.error(
			`[Band Play] The ${pageName} page failed to render.`,
			error
		);
		const message = document.createElement('p');
		message.setAttribute('role', 'alert');
		message.style.margin = '16px';
		message.textContent =
			'Something went wrong. Close this page and open it again.';
		container.replaceChildren(message);
	},
});
