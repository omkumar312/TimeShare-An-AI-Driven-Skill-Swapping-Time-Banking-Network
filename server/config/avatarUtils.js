// Permanent profile avatar generator for TimeShare backend

const GRADIENTS = [
  { bg1: '#4f46e5', bg2: '#7c3aed', text: '#ffffff' }, // Indigo-Violet
  { bg1: '#0ea5e9', bg2: '#2563eb', text: '#ffffff' }, // Sky-Blue
  { bg1: '#059669', bg2: '#10b981', text: '#ffffff' }, // Emerald
  { bg1: '#d97706', bg2: '#f59e0b', text: '#ffffff' }, // Amber
  { bg1: '#e11d48', bg2: '#f43f5e', text: '#ffffff' }, // Rose
  { bg1: '#7c2d12', bg2: '#c2410c', text: '#ffffff' }, // Warm Crimson
  { bg1: '#6d28d9', bg2: '#a855f7', text: '#ffffff' }, // Purple
  { bg1: '#0f766e', bg2: '#14b8a6', text: '#ffffff' }, // Teal
];

export function getInitials(name) {
  if (!name) return 'TS';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generatePermanentAvatarSvg(name = 'Learner', role = 'user') {
  const initials = getInitials(name);
  const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const grad = role === 'admin'
    ? { bg1: '#991b1b', bg2: '#dc2626', text: '#fef08a' } // Crimson & gold for Admin
    : GRADIENTS[hash % GRADIENTS.length];

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${grad.bg1}" />
      <stop offset="100%" stop-color="${grad.bg2}" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#grad_${hash})" />
  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
  <text x="50" y="58" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="34" font-weight="800" fill="${grad.text}" text-anchor="middle" letter-spacing="1">
    ${initials}
  </text>
  ${role === 'admin' ? `
    <circle cx="80" cy="20" r="12" fill="#fbbf24" stroke="#7f1d1d" stroke-width="2" />
    <path d="M76 22 L80 16 L84 22 Z" fill="#7f1d1d" />
  ` : ''}
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PERMANENT_DEMO_AVATARS = {
  admin: generatePermanentAvatarSvg('Vikram Aditya', 'admin'),
  rahul: generatePermanentAvatarSvg('Rahul Sharma', 'user'),
  priya: generatePermanentAvatarSvg('Priya Verma', 'user'),
  aman: generatePermanentAvatarSvg('Aman Singh', 'user'),
  ananya: generatePermanentAvatarSvg('Ananya Patel', 'user'),
  arjun: generatePermanentAvatarSvg('Arjun Kumar', 'user'),
  sneha: generatePermanentAvatarSvg('Sneha Gupta', 'user'),
};
