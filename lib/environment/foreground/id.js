/* @flow */

export function getExtensionId(): string {
	return chrome.runtime.id;
}

// Safari silently fails when extension API methods are called without their receiver
export const getURL = (path: string): string => chrome.runtime.getURL(path);

export const getOptionsURL = (hash: string = '') => new URL(hash, getURL('options.html'));
export const isOptionsPage = () => location.origin === getOptionsURL().origin;
