import { Image, Leaf, Package, Shirt } from 'lucide-react';

const ICONS = { leaf: Leaf, shirt: Shirt, image: Image, package: Package };

export default function FeatureIcon({ name, className = 'h-6 w-6' }) {
  const Icon = ICONS[name] ?? Shirt;
  return <Icon className={className} strokeWidth={1.6} aria-hidden />;
}
