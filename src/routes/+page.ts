import type { PageLoad } from './$types';

export async function load({ url }: PageLoad) {
  const endpoint =
    url.searchParams.get('endpoint') ?? import.meta.env.VITE_NODE_ENDPOINT ?? 'ws://localhost:9944';
  const path = url.searchParams.get('path');
  let wallet = {};

  if (!path || path === '/wallet') {
    wallet = {
      to: url.searchParams.get('to') ?? '',
      amount: url.searchParams.get('amount') ?? ''
    };
  }

  return {
    endpoint,
    wallet
  };
}
