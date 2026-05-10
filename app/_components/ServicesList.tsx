import { SERVICES } from "../_content";

const certificateServices = SERVICES.filter(
  (s) => s.category === "certificates",
);
const currencyServices = SERVICES.filter((s) => s.category === "currency");

function ServiceColumn({
  heading,
  items,
}: {
  heading: string;
  items: readonly { label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        {heading}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="text-sm text-foreground">
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServicesList() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <ServiceColumn
        heading="Certificates & Ratings"
        items={certificateServices}
      />
      <ServiceColumn
        heading="Currency & Proficiency"
        items={currencyServices}
      />
    </div>
  );
}
