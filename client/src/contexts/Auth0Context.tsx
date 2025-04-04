
import { createContext, useContext } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

export const Auth0Context = createContext({});

export function Auth0ProviderWithConfig({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider
      domain={process.env.AUTH0_DOMAIN || ''}
      clientId={process.env.AUTH0_CLIENT_ID || ''}
      authorizationParams={{
        redirect_uri: window.location.origin + '/callback'
      }}
    >
      {children}
    </Auth0Provider>
  );
}

export function useAuth0Context() {
  return useAuth0();
}
