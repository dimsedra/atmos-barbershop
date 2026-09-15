export interface Branch {
  id: string;
  name: string;
  area: string;
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  slotsLeftToday: number;
  image: string;
  features: string[];
  mapUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
  price: number;
  targetAudience: string;
  asmrIncluded: boolean;
  description: string;
  steps: string[];
  image: string;
}

export interface ProductItem {
  id: string;
  number: string;
  name: string;
  tagline: string;
  price: number;
  volume: string;
  category: string;
  scentNotes: string[];
  routineStep: string;
  benefits: string[];
  ingredients: string;
  image: string;
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  branchId: string;
  experience: string;
  rating: number;
  specialties: string[];
  avatar: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}
