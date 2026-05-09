const CERT_RATINGS = [
  "Discovery Flights",
  "Private Pilot",
  "Instrument Rating",
  "Commercial Pilot",
  "Multiengine Add-On",
];

const CURRENCY_PROFICIENCY = [
  "Flight Reviews (BFRs)",
  "Instrument Proficiency Checks (IPCs)",
  "Rusty Pilot Refreshers",
  "Leading Edge Flying Club Checkouts",
];

function ServiceColumn({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        {heading}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServicesList() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <ServiceColumn heading="Certificates & Ratings" items={CERT_RATINGS} />
      <ServiceColumn
        heading="Currency & Proficiency"
        items={CURRENCY_PROFICIENCY}
      />
    </div>
  );
}
