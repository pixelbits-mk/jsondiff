import { expect, test } from "@jest/globals";
import * as jsondiff from "./jsondiff";

test("check that jest is working", () => {
  expect(true).toBe(true);
});

test("empty object should return empty object", () => {
  const diff = jsondiff.diff({}, {});
  expect(diff).toEqual({});
});

test("same object should return no diff", () => {
  const diff = jsondiff.diff({ name: "test" }, { name: "test" });
  expect(diff).toEqual({});
});

test("missing source property should return null", () => {
  const diff = jsondiff.diff(
    { name: "test", address: "elm street" },
    { name: "test" }
  );
  expect(diff).toEqual({ address: null });
});

test("undefined target property should return undefined", () => {
  const diff = jsondiff.diff(
    { name: "test", address: "elm street" },
    { name: "test", address: undefined }
  );
  expect(diff).toEqual({ address: undefined });
});

test("new target property should return property", () => {
  const diff = jsondiff.diff(
    { name: "test" },
    { name: "test", address: "elm street" }
  );
  expect(diff).toEqual({ address: "elm street" });
});

test("new array target property should return array", () => {
  const diff = jsondiff.diff(
    { name: "test" },
    { name: "test", array: [1, 2, 3] }
  );
  expect(diff).toEqual({ array: [1, 2, 3] });
});

test("difference in array should return changed array", () => {
  const diff = jsondiff.diff(
    { name: "test", array: [0, 2, 0] },
    { name: "test", array: [1, 2, 3] }
  );
  expect(diff).toEqual({ array: [1, 3] });
});

test("difference in both arrays should return changed array", () => {
    const diff = jsondiff.diff(
      { name: "test", array: [1,2,3] },
      { name: "test", array: [4, 5, 6] }
    );
    expect(diff).toEqual({ array: [4, 5, 6] });
  });

test("nested object target", () => {
  const diff = jsondiff.diff(
    {
      name: "test",
      address: {
        city: "New York",
        state: "New York",
      },
    },
    {
      name: "test",
      address: null,
    }
  );
  expect(diff).toEqual({ address: null });
});

test("nested object source", () => {
  const diff = jsondiff.diff(
    {
      name: "test",
      address: null,
    },
    {
      name: "test",
      address: {
        city: "New York",
        state: "New York",
      },
    }
  );
  expect(diff).toEqual({
    address: {
      city: "New York",
      state: "New York",
    },
  });
});
test("nested property change", () => {
    const diff = jsondiff.diff(
      {
        name: "test",
        address: {
            city: "New York",
            state: "New York",
        },
      },
      {
        name: "test",
        address: {
          city: "New York",
          state: "Manhatten",
        },
      }
    );
    expect(diff).toEqual({
      address: {
        state: "Manhatten",
      },
    });
  });
  
  test('test', () => {
    const x = {
        foo: { bar: 3 },
        array: [{
            does: 'work',
            too: [ 1, 2, 3 ]
        }]
    }
    
    const y = {
        foo: { baz: 4 },
        quux: 5,
        array: [{
            does: 'work',
            too: [ 4, 5, 6 ]
        }, {
            really: 'yes'
        }]
    }

    const diff = jsondiff.diff(x, y)
    expect(diff).toEqual(    {
        foo: { bar: null, baz: 4 },
        quux: 5,
        array: [{ 
            too: [4, 5, 6]
        }, { 
            really: 'yes' 
        }],
      })
  })