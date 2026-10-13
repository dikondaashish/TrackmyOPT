import { UscisController } from './uscis.controller';
import { UscisService } from './uscis.service';

it('reports actual queue dispatch separately from eligible cases', async () => {
  const queueAllActiveCases = jest
    .fn()
    .mockResolvedValue({ count: 3, skippedFree: 0, queued: 5 });
  const controller = new UscisController({
    queueAllActiveCases,
  } as unknown as UscisService);
  expect(await controller.checkAll()).toMatchObject({
    status: 'queued',
    count: 3,
    queued: 5,
    skippedFree: 0,
  });
  expect(queueAllActiveCases).toHaveBeenCalledWith(false);
});
it('reports a dry run without claiming dispatched checks', async () => {
  const queueAllActiveCases = jest
    .fn()
    .mockResolvedValue({ count: 3, skippedFree: 0, queued: 0 });
  const controller = new UscisController({
    queueAllActiveCases,
  } as unknown as UscisService);
  expect(await controller.checkAll('1')).toMatchObject({
    status: 'dry-run',
    count: 3,
    queued: 0,
  });
  expect(queueAllActiveCases).toHaveBeenCalledWith(true);
});
