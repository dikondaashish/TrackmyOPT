import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TemplateThumbnail } from './TemplateThumbnail';
import assets from '@/lib/documents/template-preview-assets.json';

vi.mock('next/image', () => ({
  default: ({
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) => (
    // Test double for next/image; production renders the Next Image component.
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

describe('template thumbnails', () => {
  it('loads a versioned image with fixed dimensions and no PDF request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<TemplateThumbnail templateId="modern" name="Modern" eager />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', assets.modern.image);
    expect(image).toHaveAttribute('width', String(assets.modern.width));
    expect(image).toHaveAttribute('height', String(assets.modern.height));
    expect(image).toHaveAttribute('loading', 'eager');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
  it('retries a failed image without selecting the parent card', () => {
    const select = vi.fn();
    render(
      <div onClick={select}>
        <TemplateThumbnail templateId="tech" name="Tech" eager={false} />
      </div>
    );
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
    fireEvent.error(screen.getByRole('img'));
    fireEvent.click(screen.getByRole('button', { name: 'Retry preview' }));
    expect(select).not.toHaveBeenCalled();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      `${assets.tech.image}?retry=1`
    );
  });
});
