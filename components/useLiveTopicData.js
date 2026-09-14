'use client';

import { useEffect, useState } from 'react';

export default function useLiveTopicData(topic) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(`/api/topic-data?topic=${encodeURIComponent(topic)}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`Live data returned ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('fallback');
      });
    return () => { cancelled = true; };
  }, [topic]);

  return { metrics: data?.metrics || {}, status, policy: data?.policy || null };
}
