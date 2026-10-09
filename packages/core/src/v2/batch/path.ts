export function buildObjectsPath(queryParams: any): string {
  const path = '/batch/objects';
  return buildPath(path, queryParams);
}

export function buildRefsPath(queryParams: any): string {
  const path = '/batch/references';
  return buildPath(path, queryParams);
}

function buildPath(path: string, queryParams: any): string {
  if (queryParams && queryParams.toString() != '') {
    path = `${path}?${queryParams.toString()}`;
  }
  return path;
}
