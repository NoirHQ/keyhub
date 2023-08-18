import type { PageLoad } from './$types';

export async function load({ fetch, params, url }: PageLoad) {
  let auth = params.auth;
  let username = url.searchParams.get('username') ?? '';
  let rememberme = false;
  let oauth2;
  const links = {
    login: '/',
    signup: '/signup'
  };
  const context = url.searchParams.get('context');

  try {
    if (auth === 'oauth2') {
      links.signup = `/signup?continue=${encodeURIComponent(url.pathname + url.search)}`;

      const clientId = url.searchParams.get('client_id');
      if (!clientId || !clientId.length) {
        throw new Error('No client_id provided');
      }
      let res = await fetch(`/api/v1/oauth2/client/${clientId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch client info');
      }
      res = await res.json();
      oauth2 = {
        clientId,
        redirectUri: url.searchParams.get('redirect_uri'),
        responseType: url.searchParams.get('response_type'),
        appName: res.app_name,
        homepageUrl: res.homepage_url,
        state: url.searchParams.get('state'),
        scope: url.searchParams.get('scope'),
        nonce: url.searchParams.get('nonce')
      };
      links.login = `/api/v1/oauth2/authorize?response_type=${oauth2.responseType}&client_id=${
        oauth2.clientId
      }&state=${oauth2.state}&redirect_uri=${oauth2.redirectUri}&scope=${oauth2.scope}${
        oauth2.nonce ? `&nonce=${oauth2.nonce}` : ''
      }`;
    }
    username = localStorage.getItem('username') ?? username;
    rememberme = !!localStorage.getItem('username');
  } catch (e) {
    auth = 'error';
  }
  return {
    auth,
    links,
    rememberme,
    username,
    context,
    oauth2
  };
}
