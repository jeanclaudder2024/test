import L from 'leaflet';

// Create custom icons for map markers
export function shipIcon(isOilVessel: boolean = false, hue: number = 210) {
  return L.divIcon({
    html: `<div style="
      background-color: hsl(${hue}, 70%, 45%); 
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="white" 
        width="14" 
        height="14"
      >
        ${
          isOilVessel 
            ? '<path d="M8 10V8H6v2H4.5a1.5 1.5 0 0 0-1.5 1.5v.5h18v-.5a1.5 1.5 0 0 0-1.5-1.5H18v-2h-2v2H8Z"/><path d="M20.54 15c-.48 0-.93.12-1.34.34L17.94 16H6.06l-1.26-.66A2.98 2.98 0 0 0 3.46 15C2.1 15 1 16.1 1 17.45V20h22v-2.55C23 16.1 21.9 15 20.54 15Z"/>'
            : '<path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z" />'
        }
      </svg>
    </div>`,
    className: 'vessel-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

export function portIcon(isOilPort: boolean = false) {
  return L.divIcon({
    html: `<div style="
      background-color: ${isOilPort ? '#e67e22' : '#2980b9'}; 
      width: 22px;
      height: 22px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="white" 
          width="12" 
          height="12"
        >
          ${
            isOilPort 
              ? '<path d="M20 13c.55 0 1-.45 1-1s-.45-1-1-1h-1V5h1c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1h1v6H4c-.55 0-1 .45-1 1s.45 1 1 1h1v6H4c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1h-1v-6h1zm-8 3c-1.66 0-3-1.32-3-2.95 0-1.3.52-1.67 3-4.55 2.47 2.86 3 3.24 3 4.55 0 1.63-1.34 2.95-3 2.95z"/>'
              : '<path d="M14 6l-3-3-3 3H3v8h18V6zM5 12V8h2v4zm3 0V8h2v4zm3 0V8h2v4zm3 0V8h2v4z"/>'
          }
        </svg>
      </div>
    </div>`,
    className: 'port-icon',
    iconSize: [22, 22],
    iconAnchor: [11, 22]
  });
}

export function refineryIcon() {
  return L.divIcon({
    html: `<div style="
      background-color: #c0392b; 
      width: 22px;
      height: 22px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="white" 
          width="12" 
          height="12"
        >
          <path d="M19 19V8h-4v11h4zm-7 0V3h-4v16h4zm-7 0v-8H1v8h4zm19 0v-5h-4v5h4zm-4-7h4V9h-4v3zM8 5V3H4v2h4zm11-2h-4v2h4V3z"/>
        </svg>
      </div>
    </div>`,
    className: 'refinery-icon',
    iconSize: [22, 22],
    iconAnchor: [11, 22]
  });
}