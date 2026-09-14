'use client';

import { useEffect, useRef, useState } from 'react';

export default function SmartSelect({ label, value, options = [], onChange, disabled = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const normalized = options.map((option) => typeof option === 'string' ? { value: option, label: option } : option);

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
        <span className="smart-select-value" title={String(value)}>{value}</span>
        <span className="smart-select-chevron" aria-hidden="true">⌄</span>
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
            <div className="smart-select-options">
              {normalized.map((option) => {
                const selected = String(option.value) === String(value);
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`smart-select-option ${selected ? 'is-selected' : ''}`}
                    onClick={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {selected && <b aria-hidden="true">✓</b>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
