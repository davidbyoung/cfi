export const SERVICES = [
  {
    id: "lefc-checkout",
    label: "Leading Edge Flying Club Checkout",
    category: "currency",
  },
  { id: "discovery", label: "Discovery Flight", category: "certificates" },
  { id: "private", label: "Private Pilot", category: "certificates" },
  { id: "instrument", label: "Instrument Rating", category: "certificates" },
  { id: "commercial", label: "Commercial Pilot", category: "certificates" },
  { id: "multi-engine", label: "Multi-Engine", category: "certificates" },
  { id: "flight-review", label: "Flight Reviews (BFRs)", category: "currency" },
  {
    id: "ipc",
    label: "Instrument Proficiency Checks (IPCs)",
    category: "currency",
  },
  { id: "rusty-pilot", label: "Rusty Pilot Refreshers", category: "currency" },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];
export type ServiceCategory = (typeof SERVICES)[number]["category"];

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

export const PAYMENT_METHODS_LINE =
  "Payment accepted via Venmo, Zelle, or cash.";
