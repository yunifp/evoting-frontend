/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as icons from 'lucide-react';

interface DynamicIconProps extends icons.LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  if (!name) return <icons.LayoutTemplate {...props} />;
    const pascalCaseName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  const IconComponent = (icons as any)[pascalCaseName] || icons.LayoutTemplate;
  
  return <IconComponent {...props} />;
};