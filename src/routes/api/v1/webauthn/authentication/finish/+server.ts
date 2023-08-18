import type { Authenticator, User, Key } from '$server/v1/types/types.server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { error, json } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { WEBAUTHN_RP_ID, WEBAUTHN_RP_ORIGIN } from '$server/libs/config.server';
import { filedb } from '$server/libs/filedb.server';
import { challenge, user } from '$server/libs/stores.server';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const expectedChallenge = get<string>(challenge);
    const username = get<string>(user);

    if (!filedb.exist('users', username) || !filedb.exist('keys', username)) {
      throw new Error('user does not exist', { cause: 'NOT_EXIST_USER_ERROR' });
    }
    const currentUser = await filedb.read<User>('users', username);
    const keys = await filedb.read<Key[]>('keys', username);
    const foundKeys = keys.filter((key) => key.credential_id === body.id);
    if (!foundKeys) {
      throw new Error('user does not exist', { cause: 'NOT_EXIST_USER_ERROR' });
    }
    const key = foundKeys[0];
    const authenticator: Authenticator = JSON.parse(key.cred);

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: WEBAUTHN_RP_ORIGIN,
        expectedRPID: WEBAUTHN_RP_ID,
        authenticator: {
          credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
          credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
          counter: authenticator.counter,
          transports: authenticator.transports
        }
      });
    } catch (e) {
      throw new Error('failed to verify', { cause: 'WEBAUTHN_GET_ERROR' });
    }

    currentUser.signin_at = new Date();
    await filedb.write('users', username, currentUser);
    key.last_used_at = currentUser.signin_at;
    await filedb.write('keys', username, keys);

    challenge.set('');

    if (verification.verified) {
      return json('authenticated');
    } else {
      throw new Error('failed to verify', { cause: 'WEBAUTHN_GET_ERROR' });
    }
  } catch (e: unknown) {
    if (e.cause === 'NOT_EXIST_USER_ERROR') {
      throw error(400, {
        code: e.cause,
        message: e.message
      });
    } else {
      throw error(500, {
        code: e.cause ? e.cause : 'UNKNOWN_ERROR',
        message: e.message
      });
    }
  }
}
