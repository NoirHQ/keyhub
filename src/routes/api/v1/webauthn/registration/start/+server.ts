import { generateRegistrationOptions } from '@simplewebauthn/server';
import { error, json } from '@sveltejs/kit';
import { v4 } from 'uuid';
import { WEBAUTHN_RP_ID, WEBAUTHN_RP_NAME } from '$server/libs/config.server';
import { filedb } from '$server/libs/filedb.server';
import { challenge, user, uuid } from '$server/libs/stores.server';

export async function POST({ request }) {
  try {
    const { username, requireResidentKey } = await request.json();

    if (filedb.exist('users', username) || filedb.exist('keys', username)) {
      throw new Error('already exist user', { cause: 'EXIST_USER_ERROR' });
    }

    const userID = v4();
    const options = generateRegistrationOptions({
      rpName: WEBAUTHN_RP_NAME,
      rpID: WEBAUTHN_RP_ID,
      userID,
      userName: username,
      userDisplayName: username,
      authenticatorSelection: {
        requireResidentKey
      },
      supportedAlgorithmIDs: [-7],
    });

    user.set(username);
    uuid.set(userID);
    challenge.set(options.challenge);

    return json({ publicKey: options });
  } catch (e: unknown) {
    if (e.cause === 'EXIST_USER_ERROR') {
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
