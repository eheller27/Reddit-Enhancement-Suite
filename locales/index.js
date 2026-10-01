/* @flow */

import { mapValues } from 'lodash-es';
import { loadLocale } from './loader';

// `en-ca` -> `en_CA`
function redditLocaleToTransifexLocale(redditLocale) {
	switch (redditLocale) {
		case 'leet':
			return 'en'; // doesn't appear to exist
		case 'lol':
			return 'en_lolcat';
		case 'pir':
			return 'en_pirate';
		case 'es-ar': // argentina
		case 'es-cl': // chile
			return 'es_419'; // latin america
		default: {
			// `es-ar` -> `es_ar`
			const normalized = redditLocale.replace('-', '_');
			const inx = normalized.indexOf('_');
			if (inx === -1) {
				// `zh` -> `zh`
				return normalized;
			} else {
				// `en_au` -> `en_AU`
				return `${normalized.slice(0, inx)}_${normalized.slice(inx + 1).toUpperCase()}`;
			}
		}
	}
}

export async function getLocaleDictionary(localeName: string): Promise<{ [string]: string }> {
	const transifexLocale = redditLocaleToTransifexLocale(localeName);

	const [base, language, exact] = await Promise.all([
		// 3. Default (en)
		loadLocale('en'),
		// 2. Match without region (en_CA -> en)
		transifexLocale.includes('_') ? loadLocale(transifexLocale.slice(0, transifexLocale.indexOf('_'))) : undefined,
		// 1. Exact match (en_CA -> en_CA)
		loadLocale(transifexLocale),
	]);

	const mergedLocales = { ...base, ...language, ...exact };

	return mapValues(mergedLocales, x => x.message);
}
