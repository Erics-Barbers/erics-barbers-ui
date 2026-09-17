import { GET } from '@/app/api/debug-sentry/route';

describe('Sentry debug route', () => {
  const originalValue = process.env.SENTRY_DEBUG_ENABLED;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.SENTRY_DEBUG_ENABLED;
    } else {
      process.env.SENTRY_DEBUG_ENABLED = originalValue;
    }
  });

  it('returns not found when diagnostics are disabled', async () => {
    delete process.env.SENTRY_DEBUG_ENABLED;

    const response = await GET();

    expect(response.status).toBe(404);
  });

  it('throws a test error when diagnostics are enabled', async () => {
    process.env.SENTRY_DEBUG_ENABLED = 'true';

    await expect(GET()).rejects.toThrow('Sentry server test error');
  });
});
