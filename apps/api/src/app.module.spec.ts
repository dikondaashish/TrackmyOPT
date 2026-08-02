import { appConfigValidationSchema } from './app.module';

const completeConfig = {
  NODE_ENV: 'production',
  API_SECRET_KEY: 'production-api-secret',
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'access-key',
  AWS_SECRET_ACCESS_KEY: 'secret-key',
  AWS_S3_BUCKET: 'bucket',
  USCIS_CLIENT_ID: 'client-id',
  USCIS_CLIENT_SECRET: 'client-secret',
  USCIS_API_BASE_URL: 'https://example.com/case-status',
  USCIS_TOKEN_URL: 'https://example.com/oauth/token',
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
  CRON_SECRET: 'cron-secret',
};

describe('AppModule environment validation', () => {
  it('accepts the complete production service configuration', () => {
    expect(
      appConfigValidationSchema.validate(completeConfig).error,
    ).toBeUndefined();
  });

  it('fills official USCIS URL defaults when omitted', () => {
    const config = { ...completeConfig };
    delete config.USCIS_API_BASE_URL;
    delete config.USCIS_TOKEN_URL;

    const result = appConfigValidationSchema.validate(config);
    expect(result.error).toBeUndefined();
    const value = result.value as typeof completeConfig;
    expect(value.USCIS_API_BASE_URL).toBe('https://api.uscis.gov/case-status');
    expect(value.USCIS_TOKEN_URL).toBe(
      'https://api.uscis.gov/oauth/accesstoken',
    );
  });

  it('starts without notification fan-out env (Render-compatible)', () => {
    const config = { ...completeConfig };
    delete config.NEXT_PUBLIC_SITE_URL;
    delete config.CRON_SECRET;

    expect(appConfigValidationSchema.validate(config).error).toBeUndefined();
  });

  it.each([
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'AWS_S3_BUCKET',
    'USCIS_CLIENT_SECRET',
  ])('fails startup when %s is missing', (key) => {
    const config = { ...completeConfig };
    delete config[key as keyof typeof config];

    expect(appConfigValidationSchema.validate(config).error).toBeDefined();
  });
});
