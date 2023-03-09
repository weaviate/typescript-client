export function buildObjectsPath(queryParams: any) {
  let path = "/batch/objects";
  return buildPath(path, queryParams)
}

export function buildRefsPath(queryParams: any) {
  let path = "/batch/references";
  return buildPath(path, queryParams)
}

function buildPath(path: string, queryParams: any) {
  if (queryParams && queryParams.toString() != "") {
    path = `${path}?${queryParams.toString()}`
  }
  return path
}
