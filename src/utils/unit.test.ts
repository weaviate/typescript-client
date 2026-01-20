import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../connection/http.js';
import { downloadImageFromURLAsBase64 } from './base64.js';

vi.mock('../../src/connection/http.js');

describe('downloadImageFromURLAsBase64()', () => {
  const mockHttpClient = {
    externalGet: vi.fn(),
    close: vi.fn(),
    post: vi.fn(),
    head: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    externalPost: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    getRaw: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(httpClient).mockReturnValue(mockHttpClient);
  });

  it('should convert a downloaded image to base64', async () => {
    const mockUrl = 'https://example.com/image.jpg';
    const mockImageData = Buffer.from('image binary data');

    mockHttpClient.externalGet.mockResolvedValue(mockImageData);

    const result = await downloadImageFromURLAsBase64(mockUrl);

    expect(result).toBe(mockImageData.toString('base64'));
    expect(httpClient).toHaveBeenCalledWith({ headers: { 'Content-Type': 'image/*' }, host: '' });
    expect(mockHttpClient.externalGet).toHaveBeenCalledWith(mockUrl);
  });

  it('should throw an error if the URL is invalid', async () => {
    const invalidUrl = 'invalid-url';

    await expect(downloadImageFromURLAsBase64(invalidUrl)).rejects.toThrow('Invalid URL');
  });

  it('should throw an error if the image download fails', async () => {
    const mockUrl = 'https://example.com/image.jpg';

    mockHttpClient.externalGet.mockRejectedValue(new Error('Network error'));

    await expect(downloadImageFromURLAsBase64(mockUrl)).rejects.toThrow('Failed to download image from URL');
    expect(httpClient).toHaveBeenCalledWith({ headers: { 'Content-Type': 'image/*' }, host: '' });
    expect(mockHttpClient.externalGet).toHaveBeenCalledWith(mockUrl);
  });

  it('should handle empty response data gracefully', async () => {
    const mockUrl = 'https://example.com/image.jpg';

    mockHttpClient.externalGet.mockResolvedValue(Buffer.alloc(0));

    const result = await downloadImageFromURLAsBase64(mockUrl);

    expect(result).toBe('');
    expect(httpClient).toHaveBeenCalledWith({ headers: { 'Content-Type': 'image/*' }, host: '' });
    expect(mockHttpClient.externalGet).toHaveBeenCalledWith(mockUrl);
  });

  it('should throw an error if the response is not a buffer', async () => {
    const mockUrl = 'wrong-url.com';

    mockHttpClient.externalGet.mockResolvedValue('not a buffer');

    await expect(downloadImageFromURLAsBase64(mockUrl)).rejects.toThrow('Invalid URL');
  });
});
