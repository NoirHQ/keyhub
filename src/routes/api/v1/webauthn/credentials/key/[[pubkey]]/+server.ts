import type { Key } from '$server/v1/types/types.server';
import { error, text } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { filedb } from '$server/libs/filedb.server';
import { user } from '$server/libs/stores.server';

export async function GET({ params }) {
  try {
    const username = get<string>(user);
    if (!filedb.exist('users', username) || !filedb.exist('keys', username)) {
      throw new Error('user does not exist', { cause: 'NOT_EXIST_USER_ERROR' });
    }

    const { pubkey } = params;
    const foundKeys = await filedb.read<Key[]>('keys', username);
    const keys = foundKeys.filter((key) => key.public_key === pubkey);
    if (keys) {
      return text(keys[0].credential_id);
    } else {
      throw new Error('matched key does not exist', { cause: 'DB_RESULT_ERROR' });
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
