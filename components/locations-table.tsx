import { listVisitorLocations } from "@/lib/location/repository";

function formatCoordinate(value: { toString(): string } | null) {
  if (value == null) {
    return "—";
  }
  return Number(value.toString()).toFixed(5);
}

export async function LocationsTable() {
  let locations: Awaited<ReturnType<typeof listVisitorLocations>> = [];
  let loadError = false;

  try {
    locations = await listVisitorLocations();
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <p className="text-sm leading-6 text-amber-800 dark:text-amber-200">
        Could not read the database. Check DATABASE_URL and that the latest
        migration has been applied.
      </p>
    );
  }

  if (locations.length === 0) {
    return (
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        No rows in <code className="font-mono text-[0.9em]">visitor_locations</code>{" "}
        yet. Open this page once, then refresh. GPS is optional; country and
        network details are stored even if you block precise location.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
          <tr>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">GPS</th>
            <th className="px-4 py-3 font-medium">Country</th>
            <th className="px-4 py-3 font-medium">City</th>
            <th className="px-4 py-3 font-medium">ISP / network</th>
            <th className="px-4 py-3 font-medium">Timezone</th>
            <th className="px-4 py-3 font-medium">IP</th>
            <th className="px-4 py-3 font-medium">Permission</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr
              key={location.id}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
            >
              <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                {location.createdAt.toISOString().replace("T", " ").slice(0, 19)} UTC
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono">
                {location.latitude == null || location.longitude == null
                  ? "—"
                  : `${formatCoordinate(location.latitude)}, ${formatCoordinate(location.longitude)}`}
              </td>
              <td className="px-4 py-3">
                {location.country ?? location.countryCode ?? "—"}
              </td>
              <td className="px-4 py-3">
                {[location.city, location.region].filter(Boolean).join(", ") || "—"}
              </td>
              <td className="px-4 py-3">
                {location.isp ?? location.networkEffectiveType ?? "—"}
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {location.timezone ?? "—"}
              </td>
              <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">
                {location.ipAddress ?? "—"}
              </td>
              <td className="px-4 py-3">{location.permission}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
