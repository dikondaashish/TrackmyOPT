import { ExternalLink, Landmark } from "lucide-react";

const USCIS_EVERIFY_SEARCH_URL =
  "https://bigdataanalyticspub-sb.uscis.dhs.gov/views/E-VerifyEmployerSearch_17259895596010/Dashboard?:embed=y&:showVizHome=no&:toolbar=bottom";
const USCIS_EVERIFY_PAGE_URL =
  "https://www.e-verify.gov/e-verify-employer-search";

export function OfficialEVerifyEmployerSearch() {
  return (
    <section
      aria-labelledby="official-everify-search-heading"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-gray-800"
    >
      <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="official-everify-search-heading"
                  className="text-lg font-bold text-gray-950 dark:text-white"
                >
                  Official USCIS E-Verify Employer Search
                </h2>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  Official public tool
                </span>
              </div>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                Search directly in the USCIS public employer database without
                leaving TrackMyOPT. This tool and its results are controlled by
                USCIS, not TrackMyOPT.
              </p>
            </div>
          </div>
          <a
            href={USCIS_EVERIFY_PAGE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus-visible:ring-offset-gray-800"
          >
            Open on USCIS
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="bg-white p-2 dark:bg-gray-900 sm:p-4">
        <iframe
          title="USCIS E-Verify Employer Search"
          src={USCIS_EVERIFY_SEARCH_URL}
          className="h-[900px] w-full rounded-xl border-0 bg-white dark:bg-gray-900"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <p className="border-t border-slate-200 px-5 py-3 text-xs leading-5 text-gray-600 dark:border-slate-700 dark:text-gray-400 sm:px-6">
        If the embedded search does not load, use “Open on USCIS” above. USCIS
        publishes and updates this public tool independently.
      </p>
    </section>
  );
}
