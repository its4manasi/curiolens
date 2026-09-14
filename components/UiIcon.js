export default function UiIcon({ name, size = 20, className = '' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className };
  const icons = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></>,
    topics: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    compare: <><path d="M5 19V11"/><path d="M12 19V5"/><path d="M19 19v-6"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></>,
    stories: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    sources: <><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    education: <><path d="m3 9 9-5 9 5-9 5Z"/><path d="M7 12v4c3 2 7 2 10 0v-4"/></>,
    health: <><path d="M12 21S4 16.5 4 10a4 4 0 0 1 7-2.6A4 4 0 0 1 18 10c0 6.5-6 11-6 11Z"/><path d="M9 12h6M12 9v6"/></>,
    women: <><circle cx="12" cy="8" r="4"/><path d="M12 12v8M8.5 16h7"/></>,
    development: <><path d="M4 19V9M10 19V5M16 19v-7M3 19h18"/><path d="m5 7 5-3 5 5 5-4"/></>,
    democracy: <><path d="M3 10h18L12 4Z"/><path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18"/></>,
    welfare: <><path d="M4 13c3-2 5-2 8 0 3-2 5-2 8 0"/><path d="M6 13v5h12v-5"/><path d="M8 9c0-2 1.5-3 4-3s4 1 4 3"/></>,
    climate: <><path d="M12 21c5-2 8-6 8-11-5 0-9 3-11 8"/><path d="M4 20c2-5 6-9 12-12"/></>,
    economy: <><circle cx="12" cy="12" r="8"/><path d="M15 8.5c-.7-.8-1.7-1.2-3-1.2-1.7 0-3 1-3 2.3 0 3.3 6 1.5 6 4.7 0 1.4-1.3 2.4-3.2 2.4-1.4 0-2.6-.5-3.3-1.4M12 5.5v13"/></>,
    environment: <><path d="M5 20c2-7 7-12 14-15 0 7-4 13-11 13"/><path d="M5 20c4-3 8-6 12-8"/></>,
    local: <><path d="M4 20V8l8-4 8 4v12"/><path d="M8 20v-5h8v5M8 10h1M12 10h1M16 10h1"/></>,
  };
  return <svg {...common}>{icons[name] || icons.topics}</svg>;
}
