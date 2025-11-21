'use client';

import React, { createContext, useContext } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: typeof signIn;
  signOut: typeof signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  return (
    <AuthContext.Provider
      value={{
        user: session?.user,
        isLoading: status === 'loading',
        isAuthenticated: !!session?.user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}