import { useCallback, useEffect, useRef, useState } from "react";

/** Axios errors bury the useful message. Pull it out once, here. */
export function getErrorMessage(err, fallback = "Something went wrong") {
  return err?.response?.data?.error || err?.message || fallback;
}

/**
 * The load/error/data triplet every page was hand-rolling.
 *
 *   const { data, loading, error, refetch } = useApi(
 *     () => fetchMartyrs(params), [params]
 *   );
 *
 * `deps` follows the useEffect contract — pass primitives or memoised values.
 * In-flight results are discarded if the inputs change or the component
 * unmounts, so a slow first request cannot overwrite a fast second one.
 */
export function useApi(fetcher, deps = [], { skip = false, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);

  // Keep the latest fetcher without making it a dependency — callers pass an
  // inline arrow, which would otherwise re-run the effect on every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(() => fetcherRef.current())
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((err) => {
        if (!active) return;
        setError(getErrorMessage(err));
        setData(initialData);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, skip]);

  return { data, loading, error, refetch, setData };
}
