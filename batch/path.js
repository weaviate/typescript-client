export function buildObjectsPath(queryParams) {
  let path = "/batch/objects";
  return buildPath(path, queryParams)
}

export function buildRefsPath(queryParams) {
  let path = "/batch/references";
  return buildPath(path, queryParams)
}

function buildPath(path, queryParams) {
  if (queryParams && queryParams.toString() != "") {
    path = `${path}?${queryParams.toString()}`
  }
  return path
}
