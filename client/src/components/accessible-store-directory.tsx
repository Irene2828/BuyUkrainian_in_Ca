import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Store } from "@/lib/data";

export function AccessibleStoreDirectory() {
  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
  });

  const grouped = stores.reduce((acc, store) => {
    const prov = store.province || "Other";
    if (!acc[prov]) acc[prov] = [];
    acc[prov].push(store);
    return acc;
  }, {} as Record<string, Store[]>);

  const sortedProvinces = Object.keys(grouped).sort();

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-50 focus-within:bg-white focus-within:p-8 focus-within:w-full focus-within:h-screen focus-within:overflow-y-auto" aria-label="Text alternative to the interactive map">
      <h2 tabIndex={0} id="text-directory-heading">Stores Directory (Text View)</h2>
      <p>This is a text alternative to the interactive map, grouped by province.</p>
      {sortedProvinces.map((prov) => (
        <section key={prov} aria-labelledby={`prov-${prov}`}>
          <h3 id={`prov-${prov}`} className="text-xl font-bold mt-6 mb-4">{prov}</h3>
          <ul className="space-y-4" aria-label={`Stores in ${prov}`}>
            {grouped[prov].map((store) => (
              <li key={store.id} className="border p-4">
                <h4 className="font-semibold text-lg">{store.name}</h4>
                <p>{store.address}, {store.city}</p>
                <p>Categories: {store.category}</p>
                <p>Products: {store.products.join(", ")}</p>
                {store.website && (
                  <a href={store.website.startsWith('http') ? store.website : `https://${store.website}`} target="_blank" rel="noopener noreferrer" aria-label={`Visit website for ${store.name}`}>
                    Visit Website
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
