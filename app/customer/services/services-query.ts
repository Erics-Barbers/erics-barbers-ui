export type Service = {
  id: string;
  name: string;
  description: string;
  pricePence: number;
};

export const servicesQueryKey = ['services'] as const;
export const servicesStaleTime = 5 * 60 * 1000;

export function formatServicePrice(pricePence: number) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    style: 'currency',
  }).format(pricePence / 100);
}

export async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/services', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to load services');
  }

  return (await res.json()) as Service[];
}
