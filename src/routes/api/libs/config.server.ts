import { homedir } from 'os';
import { env } from '$env/dynamic/private';

export const WEBAUTHN_RP_ID = env.WEBAUTHN_RP_ID ?? 'localhost';
export const WEBAUTHN_RP_ORIGIN = env.WEBAUTHN_RP_ORIGIN ?? 'http://localhost:5173';
export const WEBAUTHN_RP_NAME = env.WEBAUTHN_RP_NAME ?? 'keyhub';
export const FILEDB_PATH = env.FILEDB_PATH ?? `${homedir()}/.keyhub/db`;
