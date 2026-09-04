import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OracleJobDataStore } from './oracle-job-data-store';
import { resolveJobDataStore } from './job-data-store.config';
import { OracleShadowProbeService } from './oracle-shadow-probe.service';

type ConfigValues = Record<string, boolean | number | string | undefined>;

function setup(values: ConfigValues = {}) {
  const config = {
    get: jest.fn(<T>(key: string) => values[key] as T),
  } as unknown as ConfigService;
  return { config, service: new OracleShadowProbeService(config) };
}

describe('OracleShadowProbeService', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not construct Oracle when the boot flag is disabled', async () => {
    const { service } = setup({ ORACLE_SHADOW_PROBE_ON_BOOT: false });
    const fromEnvironment = jest.spyOn(OracleJobDataStore, 'fromEnvironment');

    await service.runProbe();

    expect(fromEnvironment).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('starts the detached probe only when the boot flag is enabled', () => {
    const { service } = setup({ ORACLE_SHADOW_PROBE_ON_BOOT: true });
    const runProbe = jest
      .spyOn(service, 'runProbe')
      .mockResolvedValue(undefined);

    service.onModuleInit();

    expect(runProbe).toHaveBeenCalledTimes(1);
  });

  it('runs only healthCheck with the dedicated Oracle variables when enabled', async () => {
    const { service } = setup({
      ORACLE_SHADOW_PROBE_ON_BOOT: true,
      ORACLE_JOB_DB_CONNECT_STRING: 'tcps://example/service',
      ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOB_APP',
      ORACLE_JOB_DB_PASSWORD: 'test-secret',
      ORACLE_JOB_DB_POOL_MAX: 3,
    });
    const healthCheck = jest.fn().mockResolvedValue(undefined);
    const close = jest.fn().mockResolvedValue(undefined);
    const fromEnvironment = jest
      .spyOn(OracleJobDataStore, 'fromEnvironment')
      .mockReturnValue({ healthCheck, close } as unknown as OracleJobDataStore);

    await service.runProbe();

    expect(fromEnvironment).toHaveBeenCalledWith({
      ORACLE_JOB_DB_CONNECT_STRING: 'tcps://example/service',
      ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOB_APP',
      ORACLE_JOB_DB_PASSWORD: 'test-secret',
      ORACLE_JOB_DB_POOL_MAX: '3',
    });
    expect(healthCheck).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenNthCalledWith(1, 'Oracle shadow probe started');
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/^Oracle shadow probe succeeded \(\d+ms\)$/),
    );
  });

  it('closes the pool after a successful health check', async () => {
    const { service } = setup({ ORACLE_SHADOW_PROBE_ON_BOOT: true });
    const close = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(OracleJobDataStore, 'fromEnvironment').mockReturnValue({
      healthCheck: jest.fn().mockResolvedValue(undefined),
      close,
    } as unknown as OracleJobDataStore);

    await service.runProbe();

    expect(close).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('closes the pool after a failed health check', async () => {
    const { service } = setup({ ORACLE_SHADOW_PROBE_ON_BOOT: true });
    const close = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(OracleJobDataStore, 'fromEnvironment').mockReturnValue({
      healthCheck: jest.fn().mockRejectedValue(new Error('private detail')),
      close,
    } as unknown as OracleJobDataStore);

    await expect(service.runProbe()).resolves.toBeUndefined();

    expect(close).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^Oracle shadow probe failed \(\d+ms\)$/),
    );
    expect(errorSpy.mock.calls.flat().join(' ')).not.toContain(
      'private detail',
    );
  });

  it('swallows Oracle failures without changing production storage selection', async () => {
    const { service } = setup({ ORACLE_SHADOW_PROBE_ON_BOOT: true });
    jest.spyOn(OracleJobDataStore, 'fromEnvironment').mockImplementation(() => {
      throw new Error('connection failed');
    });

    await expect(service.runProbe()).resolves.toBeUndefined();

    expect(resolveJobDataStore(undefined)).toBe('supabase');
    expect(resolveJobDataStore('supabase')).toBe('supabase');
    expect(errorSpy.mock.calls.flat().join(' ')).not.toContain(
      'connection failed',
    );
  });

  it('keeps JOB_DATA_STORE defaulted to Supabase', () => {
    expect(resolveJobDataStore(undefined)).toBe('supabase');
    expect(resolveJobDataStore('')).toBe('supabase');
  });
});
