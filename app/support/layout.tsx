import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Support the solo developer behind PuffBreak. Keep the servers running and the project free of ads.',
  alternates: {
    canonical: 'https://puffbreak.app/support',
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
