import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/workspace/access/route";

const originalAccessCode = process.env.WORKSPACE_ACCESS_CODE;

afterEach(() => {
  if (originalAccessCode === undefined) {
    delete process.env.WORKSPACE_ACCESS_CODE;
  } else {
    process.env.WORKSPACE_ACCESS_CODE = originalAccessCode;
  }
});

describe("workspace access route", () => {
  it("accepts the configured workspace access code", async () => {
    process.env.WORKSPACE_ACCESS_CODE = "9999";

    const response = await POST(
      new Request("http://localhost/api/workspace/access", {
        method: "POST",
        body: JSON.stringify({ code: "9999" })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it("rejects an invalid workspace access code", async () => {
    process.env.WORKSPACE_ACCESS_CODE = "9999";

    const response = await POST(
      new Request("http://localhost/api/workspace/access", {
        method: "POST",
        body: JSON.stringify({ code: "0000" })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.ok).toBe(false);
  });

  it("falls back to the demo code when no environment variable is set", async () => {
    delete process.env.WORKSPACE_ACCESS_CODE;

    const response = await POST(
      new Request("http://localhost/api/workspace/access", {
        method: "POST",
        body: JSON.stringify({ code: "7272" })
      })
    );

    expect(response.status).toBe(200);
  });
});
