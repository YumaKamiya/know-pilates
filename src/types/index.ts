export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export interface Problem {
  text: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon?: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface Instructor {
  name: string;
  role: string;
  image: string;
  bio: string;
  qualifications: string[];
}

export interface StudioInfo {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  hours: string[];
  mapUrl?: string;
}
