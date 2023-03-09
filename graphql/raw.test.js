import Raw from "./raw";

test("a simple raw query", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person{name}}}`;

  new Raw(mockClient).withQuery(expectedQuery).do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test("reject empty raw query", () => {
    const mockClient = {
      query: jest.fn(),
    };

    new Raw(mockClient, "").do().catch(err => {
        expect(err).toMatchObject(new Error("invalid usage: query must be set - set with .raw().withQuery(query)"));
    });
  });
