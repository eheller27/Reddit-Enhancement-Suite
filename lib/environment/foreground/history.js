/* @flow */

import { sendMessage } from './messaging';
import { isPrivateBrowsing } from './privateBrowsing';

export async function addURLToHistory(url: string): Promise<void> {
	// Safari does not implement the history API; don't wake the background worker for nothing
	if (process.env.BUILD_TARGET === 'safari') return;
	if (isPrivateBrowsing()) return;

	await sendMessage('addURLToHistory', url);
}

export function isURLVisited(url: string): Promise<boolean> {
	if (process.env.BUILD_TARGET === 'safari') return Promise.resolve(false);
	return sendMessage('isURLVisited', url);
}
