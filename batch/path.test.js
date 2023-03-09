import { buildObjectsPath, buildRefsPath } from "./path"

describe("paths", () => {
  it("builds batch objects without params", () => {
    let path = buildObjectsPath(new URLSearchParams())
    expect(path).toEqual("/batch/objects")
  })

  it("builds batch objects with params", () => {
    let path = buildObjectsPath(new URLSearchParams({
      consistency_level: "ONE"
    }))
    expect(path).toEqual("/batch/objects?consistency_level=ONE")
  })

  it("builds batch references without params", () => {
    let path = buildRefsPath(new URLSearchParams())
    expect(path).toEqual("/batch/references")
  })

  it("builds batch object with params", () => {
    let path = buildRefsPath(new URLSearchParams({
      consistency_level: "ONE"
    }))
    expect(path).toEqual("/batch/references?consistency_level=ONE")
  })
})
