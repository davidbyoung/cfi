export const SERVICES = [
  { id: "discovery", label: "Discovery flights" },
  { id: "private", label: "Private Pilot" },
  { id: "instrument", label: "Instrument Rating" },
  { id: "commercial", label: "Commercial Pilot" },
  { id: "multi-engine", label: "Multi-Engine" },
  { id: "flight-review", label: "Flight Reviews (BFRs)" },
  { id: "ipc", label: "Instrument Proficiency Checks (IPCs)" },
  { id: "rusty-pilot", label: "Rusty Pilot Refreshers" },
  { id: "lefc-checkout", label: "Leading Edge Flying Club Checkouts" },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const SERVICE_IDS: ReadonlyArray<ServiceId> = SERVICES.map((s) => s.id);

export const AIRCRAFT_SOURCE_OPTIONS = [
  {
    id: "student-provided",
    label: "I will provide the aircraft",
  },
  {
    id: "leading-edge-flying-club",
    label: "Leading Edge Flying Club",
  },
] as const;

export type AircraftSourceId = (typeof AIRCRAFT_SOURCE_OPTIONS)[number]["id"];

export const INSTRUCTOR_NAME = "Dave Young";
export const INSTRUCTOR_EMAIL = "dbyoung2@gmail.com";

export const PRIMARY_AIRPORT = "KPWK";
export const PRIMARY_AIRPORT_NAME = "Chicago Executive Airport";
export const PRIMARY_AIRPORT_LONG = "Chicago Executive Airport (KPWK)";

export const AIRCRAFT_CONSTRAINT_LINE =
  "Aircraft through Leading Edge Flying Club or student-provided.";

export const RATE_PER_HOUR = "$60/hr";

export const RATE_LINE = `Instruction is billed at ${RATE_PER_HOUR}, handshake to handshake — including flight instruction, ground instruction, preflight planning, and postflight debriefing.`;

export const PAYMENT_METHODS_LINE =
  "Payment accepted via Venmo, Zelle, or cash.";

export const CANCELLATION_LINE =
  "Please provide at least 24 hours' notice if you need to cancel or reschedule.";

export const INTAKE_EXPECTATION_LINE =
  "Fill out the form and I'll follow up by email to confirm fit, aircraft access, and training goals before we schedule anything.";

export const VALUE_PROP_LINE =
  "Independent flight instruction with a focus on clear communication, sound airmanship, and respect for your time.";

export const INSTRUCTOR_AVAILABILITY_LINE =
  "Available for instruction on weekends.";
