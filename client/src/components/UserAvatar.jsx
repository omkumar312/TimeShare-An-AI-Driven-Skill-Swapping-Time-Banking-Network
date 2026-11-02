import React, { useState } from 'react';
import { generatePermanentAvatarSvg } from '../utils/avatarUtils';

export default function UserAvatar({
  src,
  name = 'Learner',
  role = 'user',
  size = 'md',
  className = ''
}) {
  const permanentFallback = generatePermanentAvatarSvg(name, role);
  const [imgSrc, setImgSrc] = useState(src || permanentFallback);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px] rounded-lg',
    sm: 'w-7 h-7 text-xs rounded-xl',
    md: 'w-9 h-9 text-xs rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-2xl',
    xl: 'w-20 h-20 text-xl rounded-3xl'
  };

  return (
    <img
      src={imgSrc || permanentFallback}
      alt={name}
      onError={() => setImgSrc(permanentFallback)}
      className={`object-cover border border-slate-700/80 shrink-0 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    />
  );
}
