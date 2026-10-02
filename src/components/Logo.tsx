import type { FC, CSSProperties } from 'react';

interface LogoProps {
  theme: 'light' | 'dark';
  className?: string;
  height?: number;
}

export const Logo: FC<LogoProps> = ({ theme, className = '', height = 36 }) => {
  const src = theme === 'dark' ? './logo-dark.png' : './logo-light.png';

  return (
    <span className={`brand-logo ${className}`} style={{ '--logo-height': `${height}px` } as CSSProperties}>
      <span className="brand-logo__mark" aria-hidden="true"><img src={src} alt="" /></span>
      <span className="brand-logo__name">BEAM CALCULATOR</span>
    </span>
  );
};

export default Logo;
