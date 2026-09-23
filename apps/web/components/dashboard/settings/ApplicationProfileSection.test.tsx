import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApplicationProfileSection } from './ApplicationProfileSection';

describe('application profile load failure', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each(['network', 'HTTP'])(
    'does not let a failed %s load overwrite saved data',
    async (failure) => {
      vi.stubGlobal(
        'fetch',
        failure === 'network'
          ? vi.fn().mockRejectedValue(new Error('offline'))
          : vi.fn().mockResolvedValue({ ok: false })
      );
      render(<ApplicationProfileSection />);
      expect(
        await screen.findByText(/Could not load your contact details/)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Save contact details/ })
      ).toBeDisabled();
    }
  );
});
