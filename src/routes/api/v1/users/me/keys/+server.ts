import type { User, Key } from '$server/v1/types/types.server';
import { p256 } from '@noble/curves/p256';
import { blake2AsU8a, encodeAddress } from '@polkadot/util-crypto';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type VerifiedRegistrationResponse
} from '@simplewebauthn/server';
import { error, json } from '@sveltejs/kit';
import cbor from 'cbor';
import { get } from 'svelte/store';
import { WEBAUTHN_RP_ID, WEBAUTHN_RP_NAME, WEBAUTHN_RP_ORIGIN } from '$server/libs/config.server';
import { filedb } from '$server/libs/filedb.server';
import { alias, challenge, user } from '$server/libs/stores.server';
import { Authenticator } from '$server/v1/types/types.server';

export async function GET() {
  try {
    const username = get<string>(user);
    if (!filedb.exist('users', username) || !filedb.exist('keys', username)) {
      throw new Error('user does not exist', { cause: 'NOT_EXIST_USER_ERROR' });
    }

    const foundKeys = await filedb.read<Key[]>('keys', username);
    const keys = foundKeys.map((key) => {
      return {
        public_key: key.public_key,
        alias: key.alias,
        created_at: key.created_at.toString(),
        last_used_at: key.last_used_at ? key.last_used_at.toString() : '',
        is_primary: key.is_primary,
        is_active: key.is_active
      };
    });
    return json(keys);
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

export async function POST({ request }) {
  try {
    const username = get<string>(user);
    if (!filedb.exist('users', username) || !filedb.exist('keys', username)) {
      throw new Error('user does not exist', { cause: 'NOT_EXIST_USER_ERROR' });
    }
    const currentUser = await filedb.read<User>('users', username);

    const body = await request.json();

    const uuid = currentUser.user_id;
    const options = generateRegistrationOptions({
      rpName: WEBAUTHN_RP_NAME,
      rpID: WEBAUTHN_RP_ID,
      userID: uuid,
      userName: body.alias,
      userDisplayName: body.alias,
      authenticatorSelection: {
        requireResidentKey: body.requireResidentKey
      }
    });

    challenge.set(options.challenge);
    alias.set(body.alias);

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

export async function PUT({ request }) {
  try {
    const body = await request.json();
    const username = get<string>(user);
    const expectedChallenge = get<string>(challenge);

    if (!filedb.exist('users', username) || !filedb.exist('keys', username)) {
      throw new Error('user does not exist', { cause: 'NOT_EXIST_USER_ERROR' });
    }

    const { attestationObject } = body.response;
    const decodedAttestationObject = cbor.decode(Buffer.from(attestationObject, 'base64url'));
    const { authData } = decodedAttestationObject;
    const credentialIdLength = Buffer.from(authData.slice(53, 55)).readUint16BE();

    const publicKeyBytes = authData.slice(55 + credentialIdLength);
    const publicKeyObject = cbor.decode(publicKeyBytes);
    const x = publicKeyObject.get(-2);
    const y = publicKeyObject.get(-3);

    const publicKey = p256.ProjectivePoint.fromHex(
      '04' + x.toString('hex') + y.toString('hex')
    ).toRawBytes(true);
    const accountId = encodeAddress(blake2AsU8a(publicKey));

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: WEBAUTHN_RP_ORIGIN,
        expectedRPID: WEBAUTHN_RP_ID
      });
    } catch (e: unknown) {
      throw new Error('faield to verify', { cause: 'WEBAUTHN_CREATION_ERROR' });
    }

    const { verified, registrationInfo } = verification;
    const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } =
      registrationInfo!;

    const authenticator = new Authenticator(
      credentialID,
      credentialPublicKey,
      counter,
      credentialDeviceType,
      credentialBackedUp
    );

    const currentUser = await filedb.read<User>('users', username);
    const { user_id } = currentUser;

    const insertedAlias = get<string>(alias);
    const createdKey: Key = {
      user_id,
      public_key: accountId,
      alias: insertedAlias,
      credential_id: Buffer.from(credentialID).toString('base64url'),
      cred: JSON.stringify(authenticator),
      is_primary: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const keys = await filedb.read<Key[]>('keys', username);
    keys.push(createdKey);

    await filedb.write('keys', username, keys);

    challenge.set('');

    if (verified) {
      return json('added');
    } else {
      throw new Error('faield to verify', { cause: 'WEBAUTHN_CREATION_ERROR' });
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
