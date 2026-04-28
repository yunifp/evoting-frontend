/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as icons from 'lucide-react';

interface DynamicIconProps extends icons.LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Jika tidak ada nama icon, kembalikan icon fallback bawaan
  if (!name) return <icons.LayoutTemplate {...props} />;
  
  // Ubah kebab-case (file-text) menjadi PascalCase (FileText)
  const pascalCaseName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Cari komponen icon di object exports lucide-react
  const IconComponent = (icons as any)[pascalCaseName] || icons.LayoutTemplate;
  
  return <IconComponent {...props} />;
};