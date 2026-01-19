import { expect, test, vi } from 'vitest';
import Raw from './raw.js';

test('a simple raw query', () => {
  const mockClient: any = {
    query: vi.fn(),
  };

  const expectedQuery = `{Get{Person{name}}}`;

  new Raw(mockClient).withQuery(expectedQuery).do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test('reject empty raw query', () => {
  const mockClient: any = {
    query: vi.fn(),
  };

  new Raw(mockClient).do().catch((err: Error) => {
    expect(err.message).toEqual('invalid usage: query must be set - set with .raw().withQuery(query)');
  });
});
