import { assertEquals, assertThrows } from "@std/assert";
import {
  wait,
  now,
  getRandomArbitrary,
  getRandomInt,
  unimplemented,
  getKnownDeviceTypeList
} from "./utils.ts";

Deno.test("wait should delay execution", async () => {
  const start = Date.now();
  await wait(100);
  const elapsed = Date.now() - start;
  assertEquals(elapsed >= 100, true);
});

Deno.test("now should return UTC datetime string in correct format", () => {
  const result = now();
  console.log("now() result:", result);
  // Test the format: "yyyy-MM-dd'T'HH:mm:ss.SSSZZZ"
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+00:00$/;
  assertEquals(regex.test(result), true);
});

Deno.test("getRandomArbitrary should return number within range", () => {
  const min = 1;
  const max = 10;
  const result = getRandomArbitrary(min, max);
  assertEquals(result >= min && result <= max, true);
});

Deno.test("getRandomInt should return integer within range", () => {
  const min = 1;
  const max = 10;
  const result = getRandomInt(min, max);
  assertEquals(Number.isInteger(result), true);
  assertEquals(result >= min && result < max, true);
});

Deno.test("unimplemented should throw error", () => {
  assertThrows(
    () => unimplemented(),
    Error,
    "Not implemented"
  );
});

Deno.test("getKnownDeviceTypeList should return list of device types", async () => {
  const result = await getKnownDeviceTypeList();
  console.log("getKnownDeviceTypeList() result:", result);
  assertEquals(result.length > 0, true);
  assertEquals(result.includes("chunmi_tsa1"), true);
});
