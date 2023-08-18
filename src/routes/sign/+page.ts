import type { PageLoad } from './$types';

export async function load({ url }: PageLoad) {
  const endpoint = url.searchParams.get('endpoint') ?? '';
  const account = url.searchParams.get('account') ?? '';
  const palletRpc = url.searchParams.get('palletRpc') ?? '';
  const callable = url.searchParams.get('callable') ?? '';
  const params = url.searchParams.get('params') ?? '';
  return {
    endpoint,
    account,
    palletRpc,
    callable,
    params
  };
}
