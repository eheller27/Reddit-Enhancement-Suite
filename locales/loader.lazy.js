/* @flow */
/* eslint-env webextensions */

// Used instead of `loader.js` in builds that ship the locale dictionaries as separate files,
// so the background worker only parses the (at most three) dictionaries it actually needs.

const cache: Map<string, Promise<?{ [string]: { message: string } }>> = new Map();

// `en_lolcat` -> `en@lolcat.json`
const fileName = name => `${name.replace(/_(lolcat|pirate)$/, '@$1')}.json`;

export function loadLocale(name: string): Promise<?{ [string]: { message: string } }> {
	let promise = cache.get(name);
	if (!promise) {
		promise = fetch(chrome.runtime.getURL(`locales/${fileName(name)}`))
			.then(response => (response.ok ? response.json() : undefined))
			.catch(() => undefined); // locale is not available
		cache.set(name, promise);
	}
	return promise;
}
