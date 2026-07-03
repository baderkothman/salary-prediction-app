const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

const overrides: Record<string, string> = {
  UK: "United Kingdom",
};

export function formatCountry(code: string | null | undefined) {
  if (!code) return "N/A";

  const normalized = code.toUpperCase();
  if (overrides[normalized]) return overrides[normalized];

  try {
    return countryNames.of(normalized) ?? code;
  } catch {
    return code;
  }
}
