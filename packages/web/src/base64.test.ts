import { downloadImageFromURLAsBase64 } from './base64.js';
import { beforeEach, describe, expect, it, vitest, Mock } from 'vitest';

vitest.mock('../connection/http.js');

describe('downloadImageFromURLAsBase64()', () => {
  const mockFetch = vitest.fn();

  beforeEach(() => {
    vitest.clearAllMocks();
    (fetch as Mock).mockReturnValue(mockFetch);
  });

  it('should convert a downloaded image to base64', async () => {
    const mockUrl = 'https://example.com/image.jpg';
    const mockImageData = Buffer.from('image binary data');

    mockFetch.mockResolvedValue(mockImageData);

    const result = await downloadImageFromURLAsBase64(mockUrl);

    expect(result).toBe(mockImageData.toString('base64'));
    expect(fetch).toHaveBeenCalledWith({ headers: { 'Content-Type': 'image/*' }, host: '' });
    expect(mockFetch).toHaveBeenCalledWith(mockUrl);
  });

  it('should throw an error if the URL is invalid', async () => {
    const invalidUrl = 'invalid-url';

    await expect(downloadImageFromURLAsBase64(invalidUrl)).rejects.toThrow('Invalid URL');
  });

  it('should throw an error if the image download fails', async () => {
    const mockUrl = 'https://example.com/image.jpg';

    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(downloadImageFromURLAsBase64(mockUrl)).rejects.toThrow('Failed to download image from URL');
    expect(fetch).toHaveBeenCalledWith({ headers: { 'Content-Type': 'image/*' }, host: '' });
    expect(mockFetch).toHaveBeenCalledWith(mockUrl);
  });

  it('should handle empty response data gracefully', async () => {
    const mockUrl = 'https://example.com/image.jpg';

    mockFetch.mockResolvedValue(Buffer.alloc(0));

    const result = await downloadImageFromURLAsBase64(mockUrl);

    expect(result).toBe('');
    expect(fetch).toHaveBeenCalledWith({ headers: { 'Content-Type': 'image/*' }, host: '' });
    expect(mockFetch).toHaveBeenCalledWith(mockUrl);
  });

  it('should throw an error if the response is not a buffer', async () => {
    const mockUrl = 'wrong-url.com';

    mockFetch.mockResolvedValue('not a buffer');

    await expect(downloadImageFromURLAsBase64(mockUrl)).rejects.toThrow('Invalid URL');
  });
});
