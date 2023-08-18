import type { CredentialDeviceType } from '@simplewebauthn/typescript-types';

export class Authenticator {
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: CredentialDeviceType;
  credentialBackedUp: boolean;
  transports?: AuthenticatorTransport[];

  constructor(
    credentialID: Uint8Array,
    credentialPublicKey: Uint8Array,
    counter: number,
    credentialDeviceType: CredentialDeviceType,
    credentialBackedUp: boolean,
    transports?: AuthenticatorTransport[]
  ) {
    this.credentialID = Buffer.from(credentialID).toString('base64url');
    this.credentialPublicKey = Buffer.from(credentialPublicKey).toString('base64url');
    this.counter = counter;
    this.credentialDeviceType = credentialDeviceType;
    this.credentialBackedUp = credentialBackedUp;
    this.transports = transports;
  }
}

export interface User {
  user_id: string;
  created_at: Date;
  updated_at: Date;
  signin_at?: Date;
}

export interface Key {
  user_id: string;
  public_key: string;
  alias?: string;
  credential_id: string;
  cred: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_used_at?: Date;
}
