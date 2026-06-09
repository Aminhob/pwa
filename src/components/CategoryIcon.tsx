import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Gamepad2,
  Briefcase,
  Laptop,
  TrendingUp,
  Wallet,
  CircleDot,
  Tag,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  receipt: Receipt,
  'heart-pulse': HeartPulse,
  'gamepad-2': Gamepad2,
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  wallet: Wallet,
  'circle-dot': CircleDot,
  tag: Tag,
};

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
}

export function CategoryIcon({ icon, color, size = 18 }: CategoryIconProps) {
  const Icon = iconMap[icon] ?? Tag;
  return <Icon size={size} color={color} />;
}
