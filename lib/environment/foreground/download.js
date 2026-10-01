/* @flow */

import { sendMessage } from './messaging';

export async function download(url: string, filename?: string) {
	// resolve relative URLs
	const href = new URL(url, location.href).href;

	if (process.env.BUILD_TARGET === 'safari') {
		// Safari has no downloads API, and <a download> is same-origin only, so download via a blob URL
		try {
			const response = await fetch(href);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const blobUrl = URL.createObjectURL(await response.blob());
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = filename || new URL(href).pathname.split('/').pop();
			a.click();
			setTimeout(() => { URL.revokeObjectURL(blobUrl); }, 60 * 1000);
		} catch (e) {
			// e.g. the host does not allow cross-origin requests; let the user save it from a new tab instead
			console.error('Download failed, opening in new tab', e);
			sendMessage('openNewTabs', { urls: [href], focusIndex: 0 });
		}
		return;
	}

	// Firefox and Chrome <a download> is same-origin only
	sendMessage('download', { url: href, filename });
}
