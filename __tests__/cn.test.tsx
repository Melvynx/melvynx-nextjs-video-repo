import { cn } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("cn", () => {
  it("should return a string", () => {
    const result = cn("test");
    expect(result).toBe("test");
  });

  it("should return only the latest conflict class", () => {
    const result = cn("bg-red-500 bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("should return the latest class when there is no conflict", () => {
    const result = cn(
      null,
      {
        "bg-red-500": true,
      },
      "text-lg"
    );
    expect(result).toBe("bg-red-500 text-lg");
  });
});
