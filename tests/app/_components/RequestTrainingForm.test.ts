import { describe, it, expect, vi } from "vitest";
import {
  buildPayload,
  firstErrorField,
  INITIAL,
  submitTrainingRequest,
  toggleCertificate,
  toggleGoal,
  toggleRating,
  validate,
  type FormState,
} from "@/app/_components/RequestTrainingForm";

// A minimal state that satisfies every validate() rule, so each test below
// can override just the one field it's exercising.
const VALID_STATE: FormState = {
  ...INITIAL,
  fullName: "Jane Pilot",
  email: "jane@example.com",
  phone: "555-123-4567",
  airport: "kpwk",
  certificates: ["private-pilot"],
  trainingGoal: ["instrument"],
  studentProvidesAircraft: true,
};

describe("validate", () => {
  it("returns no errors for a fully valid state", () => {
    expect(validate(VALID_STATE)).toEqual({});
  });

  it("requires a full name", () => {
    expect(validate({ ...VALID_STATE, fullName: "" }).fullName).toMatch(
      /enter your full name/,
    );
    expect(validate({ ...VALID_STATE, fullName: "   " }).fullName).toMatch(
      /enter your full name/,
    );
  });

  it("rejects a full name over 120 characters", () => {
    const errors = validate({ ...VALID_STATE, fullName: "a".repeat(121) });
    expect(errors.fullName).toMatch(/too long/);
  });

  it("requires an email", () => {
    expect(validate({ ...VALID_STATE, email: "" }).email).toMatch(
      /enter your email/,
    );
  });

  it("rejects an email over 254 characters", () => {
    const longEmail = `${"a".repeat(250)}@b.co`;
    expect(validate({ ...VALID_STATE, email: longEmail }).email).toMatch(
      /too long/,
    );
  });

  it("rejects a malformed email", () => {
    expect(validate({ ...VALID_STATE, email: "not-an-email" }).email).toMatch(
      /valid email/,
    );
  });

  it("requires a phone number", () => {
    expect(validate({ ...VALID_STATE, phone: "" }).phone).toMatch(
      /enter a phone number/,
    );
  });

  it("rejects a phone number that's too short or too long", () => {
    expect(validate({ ...VALID_STATE, phone: "12345" }).phone).toMatch(
      /valid phone number/,
    );
    expect(validate({ ...VALID_STATE, phone: "1".repeat(26) }).phone).toMatch(
      /valid phone number/,
    );
  });

  it("rejects a phone number with disallowed characters", () => {
    expect(validate({ ...VALID_STATE, phone: "555-abc-4567" }).phone).toMatch(
      /may contain digits/,
    );
  });

  it("accepts phone numbers with digits, spaces, +, -, ( and )", () => {
    expect(
      validate({ ...VALID_STATE, phone: "+1 (555) 123-4567" }).phone,
    ).toBeUndefined();
  });

  it("requires an airport", () => {
    expect(validate({ ...VALID_STATE, airport: "" }).airport).toMatch(
      /select an airport/,
    );
  });

  it("requires at least one certificate selection", () => {
    expect(validate({ ...VALID_STATE, certificates: [] }).certificates).toMatch(
      /at least one option/,
    );
  });

  it("rejects an unknown certificate id", () => {
    const errors = validate({
      ...VALID_STATE,
      // @ts-expect-error deliberately invalid for the test
      certificates: ["not-a-real-certificate"],
    });
    expect(errors.certificates).toMatch(/invalid certificate/i);
  });

  it("rejects an unknown rating id", () => {
    const errors = validate({
      ...VALID_STATE,
      // @ts-expect-error deliberately invalid for the test
      ratings: ["not-a-real-rating"],
    });
    expect(errors.ratings).toMatch(/invalid rating/i);
  });

  it("allows an empty ratings selection (ratings are optional)", () => {
    expect(validate({ ...VALID_STATE, ratings: [] }).ratings).toBeUndefined();
  });

  it("requires at least one training goal", () => {
    expect(validate({ ...VALID_STATE, trainingGoal: [] }).trainingGoal).toMatch(
      /select at least one training goal/,
    );
  });

  it("rejects an unknown training-goal id", () => {
    const errors = validate({
      ...VALID_STATE,
      // @ts-expect-error deliberately invalid for the test
      trainingGoal: ["not-a-real-service"],
    });
    expect(errors.trainingGoal).toMatch(/invalid training-goal/i);
  });

  it("rejects training-goal notes over 500 characters", () => {
    const errors = validate({
      ...VALID_STATE,
      trainingGoalNotes: "a".repeat(501),
    });
    expect(errors.trainingGoalNotes).toMatch(/under 500 characters/);
  });

  it("requires confirming aircraft access", () => {
    expect(
      validate({ ...VALID_STATE, studentProvidesAircraft: false })
        .studentProvidesAircraft,
    ).toMatch(/confirm you have access/);
  });
});

describe("buildPayload", () => {
  it("maps ids to their human-readable labels", () => {
    const payload = buildPayload({
      ...VALID_STATE,
      certificates: ["private-pilot", "cfi"],
      ratings: ["instrument-rating"],
      trainingGoal: ["instrument", "ipc"],
    });

    expect(payload["Certificates"]).toBe("Private Pilot, CFI");
    expect(payload["Ratings"]).toBe("Instrument Rating");
    expect(payload["Training goal"]).toBe(
      "Instrument Rating, Instrument Proficiency Checks (IPCs)",
    );
    expect(payload["Airport"]).toBe("Chicago Executive Airport (KPWK)");
  });

  it("reports 'None' for ratings when none were selected", () => {
    const payload = buildPayload({ ...VALID_STATE, ratings: [] });
    expect(payload["Ratings"]).toBe("None");
  });

  it("omits training-goal notes entirely when blank", () => {
    const payload = buildPayload({ ...VALID_STATE, trainingGoalNotes: "  " });
    expect(payload).not.toHaveProperty("Training goal notes");
  });

  it("includes trimmed training-goal notes when present", () => {
    const payload = buildPayload({
      ...VALID_STATE,
      trainingGoalNotes: "  Weekday evenings work best.  ",
    });
    expect(payload["Training goal notes"]).toBe("Weekday evenings work best.");
  });

  it("always includes the honeypot field, even when empty", () => {
    const payload = buildPayload({ ...VALID_STATE, _gotcha: "" });
    expect(payload).toHaveProperty("_gotcha", "");
  });

  it("passes through full name, email, and phone verbatim", () => {
    const payload = buildPayload(VALID_STATE);
    expect(payload["Full name"]).toBe(VALID_STATE.fullName);
    expect(payload["Email"]).toBe(VALID_STATE.email);
    expect(payload["Phone"]).toBe(VALID_STATE.phone);
  });
});

describe("toggleCertificate", () => {
  it("adds a certificate when checked", () => {
    expect(toggleCertificate(["private-pilot"], "cfi", true)).toEqual([
      "private-pilot",
      "cfi",
    ]);
  });

  it("removes a certificate when unchecked", () => {
    expect(toggleCertificate(["private-pilot", "cfi"], "cfi", false)).toEqual([
      "private-pilot",
    ]);
  });

  it("selecting 'none' clears every other selection", () => {
    expect(toggleCertificate(["private-pilot", "cfi"], "none", true)).toEqual([
      "none",
    ]);
  });

  it("selecting any other certificate clears 'none'", () => {
    expect(toggleCertificate(["none"], "private-pilot", true)).toEqual([
      "private-pilot",
    ]);
  });
});

describe("toggleRating", () => {
  it("adds a rating when checked", () => {
    expect(toggleRating([], "instrument-rating", true)).toEqual([
      "instrument-rating",
    ]);
  });

  it("removes a rating when unchecked", () => {
    expect(
      toggleRating(
        ["instrument-rating", "multi-engine-rating"],
        "instrument-rating",
        false,
      ),
    ).toEqual(["multi-engine-rating"]);
  });
});

describe("toggleGoal", () => {
  it("adds a training goal when checked", () => {
    expect(toggleGoal([], "instrument", true)).toEqual(["instrument"]);
  });

  it("removes a training goal when unchecked", () => {
    expect(toggleGoal(["instrument", "ipc"], "instrument", false)).toEqual([
      "ipc",
    ]);
  });
});

describe("firstErrorField", () => {
  it("returns undefined when there are no errors", () => {
    expect(firstErrorField({})).toBeUndefined();
  });

  it("returns the first field in display order, not object key order", () => {
    // Deliberately constructed out of display order (phone before email) —
    // the display order (fullName, email, phone, ...) must win, since it's
    // what determines where focus actually lands.
    expect(
      firstErrorField({ phone: "bad", email: "bad", fullName: "bad" }),
    ).toBe("fullName");
  });

  it("skips fields without an error", () => {
    expect(firstErrorField({ phone: "bad" })).toBe("phone");
  });
});

describe("submitTrainingRequest", () => {
  it("returns an error status when no endpoint is configured", async () => {
    const fetchImpl = vi.fn();
    const status = await submitTrainingRequest(
      VALID_STATE,
      undefined,
      fetchImpl,
    );
    expect(status).toEqual({ kind: "error" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns a success status when the request succeeds", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const status = await submitTrainingRequest(
      VALID_STATE,
      "https://formspree.io/f/test",
      fetchImpl,
    );
    expect(status).toEqual({ kind: "success" });
  });

  it("returns an error status when the response isn't ok", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });
    const status = await submitTrainingRequest(
      VALID_STATE,
      "https://formspree.io/f/test",
      fetchImpl,
    );
    expect(status).toEqual({ kind: "error" });
  });

  it("returns an error status when the request throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const status = await submitTrainingRequest(
      VALID_STATE,
      "https://formspree.io/f/test",
      fetchImpl,
    );
    expect(status).toEqual({ kind: "error" });
  });

  it("posts the built payload as JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    await submitTrainingRequest(
      VALID_STATE,
      "https://formspree.io/f/test",
      fetchImpl,
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://formspree.io/f/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(buildPayload(VALID_STATE)),
      }),
    );
  });
});
