export interface Account {
  credentialId?: string;
  publicKey: string;
}

export interface Key {
  public_key: string;
  alias?: string;
  created_at: string;
  last_used_at: string;
  is_primary: boolean;
  is_active: boolean;
}
