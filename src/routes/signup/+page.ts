import type { PageLoad } from './$types';

export async function load({ url }: PageLoad) {
  return {
    username: '',
    useSecurityKey: false,
    verified: false,
    continue: url.searchParams.get('continue')
  };
}
