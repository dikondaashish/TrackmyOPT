import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SponsorDataController } from './sponsor-data.controller';
import type { OracleH1bFilingsReader } from './oracle-h1b-filings-reader';

function setup() {
  const reader = {
    listFilings: jest.fn().mockResolvedValue([{ id: 'a' }]),
    healthCheck: jest.fn().mockResolvedValue({ rowsChecked: 1, durationMs: 5 }),
    close: jest.fn().mockResolvedValue(undefined),
  };
  const controller = new SponsorDataController(
    reader as unknown as OracleH1bFilingsReader,
  );
  return { controller, reader };
}

describe('SponsorDataController', () => {
  let errorSpy: jest.SpyInstance;
  beforeEach(() => {
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });
  afterEach(() => errorSpy.mockRestore());

  it('returns filings for a trimmed sponsor id and name', async () => {
    const { controller, reader } = setup();
    await expect(
      controller.listFilings(' sponsor-1 ', ' Example Corp '),
    ).resolves.toEqual({ filings: [{ id: 'a' }] });
    expect(reader.listFilings).toHaveBeenCalledWith(
      'sponsor-1',
      'Example Corp',
    );
  });

  it('treats a blank employer name as absent', async () => {
    const { controller, reader } = setup();
    await controller.listFilings('sponsor-1', '  ');
    expect(reader.listFilings).toHaveBeenCalledWith('sponsor-1', undefined);
  });

  it('rejects missing or oversized lookups as bad requests', async () => {
    const { controller } = setup();
    await expect(controller.listFilings(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      controller.listFilings('sponsor-1', 'x'.repeat(301)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('turns Oracle failures into 503s and logs only the driver code', async () => {
    const { controller, reader } = setup();
    reader.listFilings.mockRejectedValue(
      Object.assign(new Error('ORA-01017: secret detail'), {
        code: 'ORA-01017',
      }),
    );

    await expect(controller.listFilings('sponsor-1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'Oracle filings lookup failed, ORA-01017',
    );
    expect(errorSpy.mock.calls.flat().join(' ')).not.toContain('secret');
  });

  it('reports health and fails health checks as 503', async () => {
    const { controller, reader } = setup();
    await expect(controller.health()).resolves.toEqual({
      ok: true,
      rowsChecked: 1,
      durationMs: 5,
    });
    reader.healthCheck.mockRejectedValue(new Error('down'));
    await expect(controller.health()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('closes the reader on shutdown', async () => {
    const { controller, reader } = setup();
    await controller.onModuleDestroy();
    expect(reader.close).toHaveBeenCalledTimes(1);
  });
});
