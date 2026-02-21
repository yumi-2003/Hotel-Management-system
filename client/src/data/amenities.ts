import type { LucideIcon } from "lucide-react";
import {
  Wifi,
  Refrigerator,
  Wind,
  Coffee,
  Tv,
  BriefcaseBusiness,
} from "lucide-react";

export type Amenity = {
  id: number;
  name: string;
  icon: LucideIcon;
};

export const amenitiesData: Amenity[] = [
  { id: 1, name: "High-Speed WiFi", icon: Wifi },
  { id: 2, name: "Mini Fridge", icon: Refrigerator },
  { id: 3, name: "Air Conditioning", icon: Wind },
  { id: 4, name: "Complimentary Breakfast", icon: Coffee },
  { id: 5, name: "Smart TV", icon: Tv },
  { id: 6, name: "Work Desk", icon: BriefcaseBusiness },
];
