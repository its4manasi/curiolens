'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export default function SmartSelect({ label, value, options = [], onChange, disabled = false, className = '', searchable }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const normalized = useMemo(() => options.map((option) => typeof option === 'string' ? { value: option, label: option } : option), [options]);
  const selected = normalized.find((option) => String(option.value) === String(value));
  const shouldSearch = searchable ?? normalized.length > 18;
  const filtered = useMemo(() => {
    if (!shouldSearch || !query.trim()) return normalized;
    const needle = query.trim().toLowerCase();
    return normalized.filter((option) => String(option.label ?? option.value).toLowerCase().includes(needle));
  }, [normalized, query, shouldSearch]);

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    const onPointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    const timer = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`smart-select ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}>
      {label && <span className="smart-select-label">{label}</span>}
      <button
        type="button"
        className="smart-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
      >
        <span className="smart-select-value" title={String(selected?.label ?? value)}>{selected?.label ?? value}</span>
        <span className="smart-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true"><path d="M5.5 7.5 10 12l4.5-4.5" /></svg>
        </span>
      </button>

      {open && !disabled && (
        <div className="smart-select-layer" onPointerDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <div className="smart-select-menu" role="listbox" aria-label={label || 'Choose an option'}>
            <div className="smart-select-mobile-head">
              <strong>{label || 'Choose an option'}</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
            {shouldSearch && <div className="smart-select-search-wrap"><input ref={searchRef} className="smart-select-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label ? label.toLowerCase() : 'options'}…`} aria-label={`Search ${label || 'options'}`} /></div>}
            <div className="smart-select-options">
              {filtered.length ? filtered.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`smart-select-option ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span className="smart-select-check" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="m5 10.2 3.1 3.1L15.4 6" /></svg></span>}
                  </button>
                );
              }) : <div className="smart-select-empty">No matching option</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
