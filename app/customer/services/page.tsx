import { headers } from 'next/headers';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import ServicesClient from './services-client';
import {
  servicesQueryKey,
  servicesStaleTime,
  type Service,
} from './services-query';

async function getServices(): Promise<Service[]> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http';

  if (!host) return [];

  const res = await fetch(`${protocol}://${host}/api/services`, {
    cache: 'no-store',
  });

  if (!res.ok) return [];

  return (await res.json()) as Service[];
}

export default async function Services() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: servicesQueryKey,
    queryFn: getServices,
    staleTime: servicesStaleTime,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServicesClient />
    </HydrationBoundary>
  );
}
