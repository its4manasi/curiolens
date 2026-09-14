'use client';

import { useEffect, useState } from 'react';
import { countryByCode } from '../lib/countries';

const COUNTRY_KEY = 'curiolens-country';

function initialCountryCode() {
  if (typeof window === 'undefined') return 'IND';
  const fromUrl = new URLSearchParams(window.location.search).get('country');
  const stored = window.localStorage.getItem(COUNTRY_KEY);
  return countryByCode(fromUrl || stored || 'IND').code;
}

export default function useLiveTopicData(topic) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [countryCode, setCountryCode] = useState('IND');

  useEffect(() => {
    const apply = (next) => setCountryCode(countryByCode(next || initialCountryCode()).code);
    apply(initialCountryCode());
    const onCountry = (event) => apply(event.detail?.countryCode);
    const onPop = () => apply(initialCountryCode());
    window.addEventListener('curiolens:country-change', onCountry);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('curiolens:country-change', onCountry);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(`/api/topic-data?topic=${encodeURIComponent(topic)}&country=${encodeURIComponent(countryCode)}`, { cache: 'no-store' })
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
  }, [topic, countryCode]);

  const country = data?.country || countryByCode(countryCode);
  return { metrics: data?.metrics || {}, status, policy: data?.policy || null, country, countryCode: country.code, countryName: country.name, isIndia: country.code === 'IND' };
}
