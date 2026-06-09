import { useState, useEffect } from 'react';

export function useLiveQuery<T>(queryFn: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void queryFn().then((result) => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}
