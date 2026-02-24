import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: React.ElementType;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, fallback: Fallback = LucideIcons.Check, ...props }) => {
  if (!name) return <Fallback {...props} />;

  // Try exact match first
  if ((LucideIcons as any)[name]) {
    const Icon = (LucideIcons as any)[name];
    return <Icon {...props} />;
  }

  // Normalize: remove dashes, spaces and case-insensitive search
  const normalizedSearch = name.toLowerCase().replace(/[-_\s]/g, "");
  
  const iconKey = Object.keys(LucideIcons).find(
    (key) => key.toLowerCase() === normalizedSearch
  );

  if (iconKey) {
    const Icon = (LucideIcons as any)[iconKey];
    return <Icon {...props} />;
  }

  // Fallback to capitalizing first letter (original logic)
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const CapitalizedIcon = (LucideIcons as any)[capitalized];
  
  if (CapitalizedIcon) {
    return <CapitalizedIcon {...props} />;
  }

  return <Fallback {...props} />;
};

export default DynamicIcon;
