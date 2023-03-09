import { buildObjectsPath, buildRefsPath } from './path';

describe('paths', () => {
  it('builds batch objects without params', () => {
    const path = buildObjectsPath(new URLSearchParams());
    expect(path).toEqual('/batch/objects');
  });

  it('builds batch objects with params', () => {
    const path = buildObjectsPath(
      new URLSearchParams({
        consistency_level: 'ONE',
      })
    );
    expect(path).toEqual('/batch/objects?consistency_level=ONE');
  });

  it('builds batch references without params', () => {
    const path = buildRefsPath(new URLSearchParams());
    expect(path).toEqual('/batch/references');
  });

  it('builds batch object with params', () => {
    const path = buildRefsPath(
      new URLSearchParams({
        consistency_level: 'ONE',
      })
    );
    expect(path).toEqual('/batch/references?consistency_level=ONE');
  });
});
