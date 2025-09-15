import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

export type IconProps = { size?: number; color?: string };

export const GridIcon = ({ size = 24, color = '#000000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* 2x2 grid of 6x6 rounded squares at (3,3), (15,3), (3,15), (15,15) */}
    <Rect x="3" y="3" width="6" height="6" rx="2" stroke={color} strokeWidth={2} />
    <Rect x="15" y="3" width="6" height="6" rx="2" stroke={color} strokeWidth={2} />
    <Rect x="3" y="15" width="6" height="6" rx="2" stroke={color} strokeWidth={2} />
    <Rect x="15" y="15" width="6" height="6" rx="2" stroke={color} strokeWidth={2} />
  </Svg>
);

export const HangerIcon = ({ size = 24, color = '#000000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Hook */}
    <Path
      d="M12 8.5c0-1.2 1-2 2.1-2 1 0 1.9.7 1.9 1.7 0 .9-.6 1.5-1.4 1.8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Triangle bar */}
    <Path
      d="M3.5 15.5l8.5-5 8.5 5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const StatsIcon = ({ size = 24, color = '#000000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Left (short) */}
    <Path d="M6 15v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    {/* Middle (tall) */}
    <Path d="M12 9v10" stroke={color} strokeWidth={2} strokeLinecap="round" />
    {/* Right (medium) */}
    <Path d="M18 12v7" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
