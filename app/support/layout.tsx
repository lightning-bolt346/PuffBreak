import { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Support the solo developer behind PuffBreak. Keep the servers running and the project free of ads.',
  alternates: {
    canonical: `${SITE_URL}/support`,
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
