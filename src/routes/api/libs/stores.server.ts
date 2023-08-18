import { writable } from 'svelte/store';

export const user = writable<string>('');
export const uuid = writable<string>('');
export const challenge = writable<string>('');
export const alias = writable<string>('');
