import {
  fetchServices,
  formatServicePrice,
} from '../app/customer/services/services-query';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

const mockedFetch = jest.fn();

describe('services query helpers', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockedFetch;
    mockedFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('loads services through the BFF route without browser cache', async () => {
    const services = [
      {
        id: 'cut',
        name: 'Haircut',
        description: 'Classic trim',
        pricePence: 1800,
      },
    ];

    mockedFetch.mockResolvedValue(jsonResponse(services));

    await expect(fetchServices()).resolves.toEqual(services);
    expect(mockedFetch).toHaveBeenCalledWith('/api/services', {
      cache: 'no-store',
    });
  });

  it('throws when services cannot be loaded', async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse({ message: 'Unavailable' }, { status: 503 }),
    );

    await expect(fetchServices()).rejects.toThrow('Failed to load services');
  });

  it('formats service prices in pounds', () => {
    expect(formatServicePrice(1250)).toBe('£12.50');
  });
});
