export const SERVICES = [
  { id: "lefc-checkout", label: "Leading Edge Flying Club Checkout" },
  { id: "discovery", label: "Discovery Flight" },
  { id: "private", label: "Private Pilot" },
  { id: "instrument", label: "Instrument Rating" },
  { id: "commercial", label: "Commercial Pilot" },
  { id: "multi-engine", label: "Multi-Engine" },
  { id: "flight-review", label: "Flight Reviews (BFRs)" },
  { id: "ipc", label: "Instrument Proficiency Checks (IPCs)" },
  { id: "rusty-pilot", label: "Rusty Pilot Refreshers" },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const SERVICE_IDS: ReadonlyArray<ServiceId> = SERVICES.map((s) => s.id);

export const CERTIFICATE_OPTIONS = [
  { id: "none", label: "None" },
  { id: "student-pilot", label: "Student Pilot" },
  { id: "private-pilot", label: "Private Pilot" },
  { id: "commercial-pilot", label: "Commercial Pilot" },
  { id: "atp", label: "ATP" },
  { id: "cfi", label: "CFI" },
] as const;

export type CertificateId = (typeof CERTIFICATE_OPTIONS)[number]["id"];

export const CERTIFICATE_IDS: ReadonlyArray<CertificateId> =
  CERTIFICATE_OPTIONS.map((c) => c.id);

export const RATING_OPTIONS = [
  { id: "instrument-rating", label: "Instrument Rating" },
  { id: "multi-engine-rating", label: "Multi-Engine Rating" },
] as const;

export type RatingId = (typeof RATING_OPTIONS)[number]["id"];

export const RATING_IDS: ReadonlyArray<RatingId> = RATING_OPTIONS.map(
  (r) => r.id,
);


export const INSTRUCTOR_NAME = "Dave Young";

export const PRIMARY_AIRPORT = "KPWK";
export const PRIMARY_AIRPORT_NAME = "Chicago Executive Airport";
export const PRIMARY_AIRPORT_LONG = "Chicago Executive Airport (KPWK)";

export const AIRCRAFT_CONSTRAINT_LINE =
  "Aircraft through Leading Edge Flying Club or student-provided.";

export const RATE_PER_HOUR = "$65/hr";

export const RATE_LINE = `Instruction is billed at ${RATE_PER_HOUR}, handshake to handshake — including flight instruction, ground instruction, preflight planning, and postflight debriefing.`;

export const PAYMENT_METHODS_LINE =
  "Payment accepted via Venmo, Zelle, or cash.";

export const CANCELLATION_LINE =
  "Please provide at least 24 hours' notice if you need to cancel or reschedule.";

export const INTAKE_EXPECTATION_LINE =
  "Fill out the form and I'll be in touch to learn more about your goals and get you started.";

export const VALUE_PROP_LINE =
  "Independent flight instruction with a focus on clear communication, sound airmanship, and respect for your time.";

export const INSTRUCTOR_AVAILABILITY_LINE =
  "Available for instruction on weekends.";
