'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface RoleRedirectProps {
  allowedRoles?: string[];
  fallbackUrl?: string;
}

export default function RoleRedirect({ allowedRoles, fallbackUrl }: RoleRedirectProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has allowed role
    if (allowedRoles && !allowedRoles.includes(session.user.role as string)) {
      // Redirect to user's appropriate dashboard
      const roleRedirects: Record<string, string> = {
        customer: '/customer',
        restaurant: '/restaurant',
        driver: '/driver',
        admin: '/admin/users',
      };

      const redirectUrl = roleRedirects[session.user.role as string] || fallbackUrl || '/';
      router.push(redirectUrl);
    }
  }, [session, status, router, allowedRoles, fallbackUrl]);

  return null;
}