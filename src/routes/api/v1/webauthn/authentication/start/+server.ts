import type { Key } from '$server/v1/types/types.server';
import type { PublicKeyCredentialDescriptorFuture } from '@simplewebauthn/typescript-types';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { error, json } from '@sveltejs/kit';
import { filedb } from '$server/libs/filedb.server';
import { challenge, user } from '$server/libs/stores.server';

export async function POST({ request }) {
  try {
    const { username } = await request.json();

    if (!filedb.exist('users', username) || !filedb.exist('keys', username)) {
      throw new Error('user does not exist', { cause: 'NOT_EXIST_USER_ERROR' });
    }

    const keys = await filedb.read<Key[]>('keys', username);
    const allowCredentials: PublicKeyCredentialDescriptorFuture[] = keys.map((key) => {
      const { transports } = JSON.parse(key.cred);
      return {
        id: Buffer.from(key.credential_id, 'base64url'),
        type: 'public-key',
        transports
      };
    });

    const options = generateAuthenticationOptions({
      allowCredentials,
      userVerification: 'preferred'
    });

    user.set(username);
    challenge.set(options.challenge);

    return json({ publicKey: options });
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
