/* @flow */

import locales from './locales';

export function loadLocale(name: string): ?{ [string]: { message: string } } {
	return locales[name];
}
