import { createContext, useContext } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

export const Auth0Context = createContext({});

export function Auth0ProviderWithConfig({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider
      domain="dev-m72usr2ic1o1o7a4.us.auth0.com"
      clientId="MC3htUPp2j4j4Mx4jYv0L3aI2rbNxMk9"
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