import type { User, Key } from '$server/v1/types/types.server';
import { p256 } from '@noble/curves/p256';
import { blake2AsU8a, encodeAddress } from '@polkadot/util-crypto';
import {
  verifyRegistrationResponse,
  type VerifiedRegistrationResponse
} from '@simplewebauthn/server';
import { error, json } from '@sveltejs/kit';
import cbor from 'cbor';
import { get } from 'svelte/store';
import { WEBAUTHN_RP_ID, WEBAUTHN_RP_ORIGIN } from '$server/libs/config.server';
import { filedb } from '$server/libs/filedb.server';
import { challenge, user, uuid } from '$server/libs/stores.server';
import { Authenticator } from '$server/v1/types/types.server';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const username = get<string>(user);

    if (filedb.exist('users', username) || filedb.exist('keys', username)) {
      throw new Error('already exist user', { cause: 'EXIST_USER_ERROR' });
    }

    const expectedChallenge = get<string>(challenge);

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
      throw new Error('failed to verify', { cause: 'WEBAUTHN_CREATION_ERROR' });
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

    const userId = get<string>(uuid);
    const createdUser: User = {
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    const createdKey: Key = {
      user_id: userId,
      public_key: accountId,
      credential_id: Buffer.from(credentialID).toString('base64url'),
      cred: JSON.stringify(authenticator),
      is_primary: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await filedb.write('users', username, createdUser);
    await filedb.write('keys', username, [createdKey]);

    user.set('');
    uuid.set('');
    challenge.set('');

    if (verified) {
      return json('added');
    } else {
      throw new Error('failed to verify', { cause: 'WEBAUTHN_CREATION_ERROR' });
    }
  } catch (e: unknown) {
    console.error(e);
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
