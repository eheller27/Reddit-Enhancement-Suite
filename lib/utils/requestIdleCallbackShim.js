/* @flow */

// Safari does not implement requestIdleCallback
// Imported first by the entry points so that it is available to every module

if (typeof requestIdleCallback === 'undefined') {
	window.requestIdleCallback = (callback, { timeout } = {}) => {
		const start = performance.now();
		return setTimeout(() => {
			callback({
				didTimeout: typeof timeout === 'number' && performance.now() - start >= timeout,
				timeRemaining: () => Math.max(0, 50 - (performance.now() - start)),
			});
		}, 1);
	};
	window.cancelIdleCallback = id => { clearTimeout(id); };
}
