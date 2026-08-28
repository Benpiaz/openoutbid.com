export type Category =
  | "AI Agents & Infrastructure"
  | "SEO & AI Visibility"
  | "Marketing & Advertising"
  | "Crypto, Web3 & Investing"
  | "Developer Tools"
  | "Business, Finance & Legal"
  | "Security, Privacy & Compliance"
  | "Health, Fitness & Wellness"
  | "Social Media & Creator Tools"
  | "Leaderboards & Attention Markets"
  | "Hiring, Jobs & Careers"
  | "Education & Learning"
  | "Agencies, Studios & Services"
  | "Ecommerce & Retail"
  | "Domains & Web Assets"
  | "Games & Entertainment"
  | "People & Profiles"
  | "Productivity & Personal Tools"
  | "Design & Creative"
  | "Writing & Content"
  | "Directories, Launch & Discovery"
  | "AI Media Generation"
  | "Audio, Voice & Podcasting"
  | "Sales & Lead Generation"
  | "Travel, Local & Lifestyle"
  | "Real Estate & Property"
  | "Media & News"
  | "Other";

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  domain: string;
  handle: string;
  logo: string;
  logoBg: string;
  category: Category;
  currentBid: number;
  clicks: number;
  createdAt: string;
}

export const CATEGORIES: Category[] = [
  "AI Agents & Infrastructure",
  "SEO & AI Visibility",
  "Marketing & Advertising",
  "Crypto, Web3 & Investing",
  "Developer Tools",
  "Business, Finance & Legal",
  "Security, Privacy & Compliance",
  "Health, Fitness & Wellness",
  "Social Media & Creator Tools",
  "Leaderboards & Attention Markets",
  "Hiring, Jobs & Careers",
  "Education & Learning",
  "Agencies, Studios & Services",
  "Ecommerce & Retail",
  "Domains & Web Assets",
  "Games & Entertainment",
  "People & Profiles",
  "Productivity & Personal Tools",
  "Design & Creative",
  "Writing & Content",
  "Directories, Launch & Discovery",
  "AI Media Generation",
  "Audio, Voice & Podcasting",
  "Sales & Lead Generation",
  "Travel, Local & Lifestyle",
  "Real Estate & Property",
  "Media & News",
  "Other",
];

// Home page pill row — short labels, matching the real site
export const HOME_PILLS: { label: string; category?: Category }[] = [
  { label: "All" },
  { label: "Agents", category: "AI Agents & Infrastructure" },
  { label: "SEO", category: "SEO & AI Visibility" },
  { label: "Marketing", category: "Marketing & Advertising" },
  { label: "Crypto", category: "Crypto, Web3 & Investing" },
  { label: "Developer", category: "Developer Tools" },
  { label: "Business", category: "Business, Finance & Legal" },
  { label: "Security", category: "Security, Privacy & Compliance" },
  { label: "Health", category: "Health, Fitness & Wellness" },
];
