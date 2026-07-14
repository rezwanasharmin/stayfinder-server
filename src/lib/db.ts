import fs from 'fs';
import path from 'path';

// Define the file paths for the local JSON database
const DB_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Types
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  rating: number;
  location: string;
  category: string;
  dateAvailable: string;
  imageUrl: string;
  images: string[];
  ownerId: string;
  ownerName: string;
  reviews: Review[];
  priority: 'high' | 'medium' | 'low';
  specs: Spec[];
  createdAt: string;
}

interface DBStructure {
  users: User[];
  listings: Listing[];
}

// Initial seed data to ensure immediate visual quality
const initialListings: Listing[] = [
  {
    id: "stay-1",
    title: "Aura Luxury Dome House with Ocean View",
    shortDescription: "Experience stargazing under a luxury dome overlooking the pristine coast.",
    description: "Nestled high above the cliffs, the Aura Luxury Dome House offers a panoramic 180-degree view of the ocean. Featuring high-end amenities, private outdoor infinity pool, and a transparent glass dome roof designed for stargazing from the comfort of a king-sized bed. Fully secluded and surrounded by wild coastal nature.",
    price: 320,
    rating: 4.9,
    location: "Cox's Bazar, Bangladesh",
    category: "Beachfront",
    dateAvailable: "2026-08-01",
    imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
    ],
    ownerId: "admin-1",
    ownerName: "StayFinder Elite",
    reviews: [
      { id: "rev-1", userName: "Adnan Chowdhury", rating: 5, comment: "Absolutely breathtaking views! The dome is extremely comfortable and clean. Worth every cent.", date: "2026-07-01" },
      { id: "rev-2", userName: "Sadia Rahman", rating: 4.8, comment: "Very peaceful stay. The infinity pool was amazing and the sunset view is unmatched.", date: "2026-07-05" }
    ],
    priority: "high",
    specs: [
      { label: "Guest Limit", value: "2 Adults" },
      { label: "Beds", value: "1 King size" },
      { label: "Pool", value: "Private Infinity" },
      { label: "Wi-Fi", value: "High-speed Starlink" }
    ],
    createdAt: "2026-06-15"
  },
  {
    id: "stay-2",
    title: "Hideout Forest A-Frame Cabin",
    shortDescription: "Charming A-frame cabin tucked in a deep pine forest with warm wood accents.",
    description: "Unplug from the digital noise in this designer A-frame cabin. Built entirely from locally-sourced cedar and pine, the Hideout cabin features a wood-burning hot tub, outdoor cinema setup, and floor-to-ceiling windows showing the majestic forest. The property has a small stream running right through the backyard.",
    price: 180,
    rating: 4.8,
    location: "Sreemangal, Sylhet",
    category: "Cabins",
    dateAvailable: "2026-07-20",
    imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80"
    ],
    ownerId: "admin-1",
    ownerName: "StayFinder Elite",
    reviews: [
      { id: "rev-3", userName: "Tanzim Hasan", rating: 5, comment: "Loved the fireplace and the forest sounds at night. The host was highly welcoming.", date: "2026-06-28" }
    ],
    priority: "medium",
    specs: [
      { label: "Guest Limit", value: "4 Adults" },
      { label: "Beds", value: "2 Queen size" },
      { label: "Heating", value: "Wood Fireplace" },
      { label: "Hot Tub", value: "Outdoor Cedar Tub" }
    ],
    createdAt: "2026-06-18"
  },
  {
    id: "stay-3",
    title: "Majestic Glass Villa with Private Lagoon",
    shortDescription: "Ultra-luxury modern glass architecture bordering a private turquoise lagoon.",
    description: "Welcome to the epitome of modern design. This villa is crafted using reinforced steel and crystal-clear smart glass panels that can frost on command. It sits directly on the edge of a crystal-clear private lagoon. Features fully integrated smart home controls, professional chef kitchen, and a private speed boat dock.",
    price: 450,
    rating: 5.0,
    location: "Bandarban, Bangladesh",
    category: "Mansions",
    dateAvailable: "2026-07-25",
    imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"
    ],
    ownerId: "admin-1",
    ownerName: "StayFinder Elite",
    reviews: [
      { id: "rev-4", userName: "Kazi Nabil", rating: 5, comment: "Simply out of this world. The glass transition from clear to private is magical. Lagoon water is crystal clean.", date: "2026-07-08" }
    ],
    priority: "high",
    specs: [
      { label: "Guest Limit", value: "6 Adults" },
      { label: "Rooms", value: "3 King Bedrooms" },
      { label: "Dock", value: "Private Boat Dock" },
      { label: "Automation", value: "Savant Smart Home" }
    ],
    createdAt: "2026-06-20"
  },
  {
    id: "stay-4",
    title: "Secluded Eco Treehouse Sanctuary",
    shortDescription: "Suspended in a high canopy of old-growth rainforest trees, built with bamboo.",
    description: "Live out your treehouse fantasy in this custom bamboo structure suspended 30 feet above the forest floor. Built completely from treated bamboo and recycled teak, it features an open-air rain shower, secure suspension bridge entry, and organic hammocks looking over the rolling hills of the tea valley.",
    price: 130,
    rating: 4.7,
    location: "Sajek Valley, Rangamati",
    category: "Treehouses",
    dateAvailable: "2026-07-18",
    imageUrl: "https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
    ],
    ownerId: "admin-1",
    ownerName: "StayFinder Elite",
    reviews: [
      { id: "rev-5", userName: "Nafis Imtiaz", rating: 4.5, comment: "Waking up in the clouds of Sajek from a treehouse is a dream. A bit of climb, but totally worth it.", date: "2026-07-02" }
    ],
    priority: "low",
    specs: [
      { label: "Guest Limit", value: "2 Adults" },
      { label: "Height", value: "30 feet above ground" },
      { label: "Shower", value: "Open-Air Rainfall" },
      { label: "Power", value: "100% Solar Powered" }
    ],
    createdAt: "2026-06-22"
  },
  {
    id: "stay-5",
    title: "Nordic Minimalist Loft Apartment",
    shortDescription: "Sleek, minimalist loft apartment with micro-cement floors and modern details.",
    description: "Located in the heart of the premium city quarter, this minimalist loft is a masterclass in Scandinavian industrial architecture. Features micro-cement floors, exposed brick walls, designer matte black hardware, and premium custom furniture. Floor to ceiling windows look out at the cityscape and light up the workspace.",
    price: 95,
    rating: 4.6,
    location: "Gulshan, Dhaka",
    category: "Apartments",
    dateAvailable: "2026-07-12",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80"
    ],
    ownerId: "admin-1",
    ownerName: "StayFinder Elite",
    reviews: [
      { id: "rev-6", userName: "Farhana Yasmin", rating: 4.7, comment: "Super chic and right next to Gulshan's best cafés. Very fast internet and clean layout.", date: "2026-07-06" }
    ],
    priority: "medium",
    specs: [
      { label: "Guest Limit", value: "2 Adults" },
      { label: "Beds", value: "1 Queen Loft bed" },
      { label: "Internet", value: "Fiber 100 Mbps" },
      { label: "Kitchen", value: "Fully equipped induction" }
    ],
    createdAt: "2026-06-24"
  },
  {
    id: "stay-6",
    title: "Infinity Sky Penthouse",
    shortDescription: "Ultra-luxury penthouse with private heated pool looking over the city skyline.",
    description: "High above the clouds, this double-story penthouse is designed for executive luxury. Complete with a private glass-edged swimming pool on the balcony, marble bathrooms, smart lights, acoustic sound system, and dedicated round-the-clock concierge services.",
    price: 390,
    rating: 4.9,
    location: "Banani, Dhaka",
    category: "Mansions",
    dateAvailable: "2026-08-10",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80"
    ],
    ownerId: "admin-1",
    ownerName: "StayFinder Elite",
    reviews: [
      { id: "rev-7", userName: "Abrar Mahmood", rating: 5, comment: "Stunning night views of Dhaka. The private pool is unmatched. Truly luxury living.", date: "2026-07-09" }
    ],
    priority: "high",
    specs: [
      { label: "Guest Limit", value: "4 Adults" },
      { label: "Size", value: "4500 Sq Ft" },
      { label: "Pool", value: "Heated sky pool" },
      { label: "Parking", value: "2 Secure slots" }
    ],
    createdAt: "2026-06-28"
  }
];

const initialUsers: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@stayfinder.com",
    passwordHash: "$2b$10$L5mVrtqOVWEcjKsDqCrGiuj4O7f42INMaPjH1B/L0P9S5CzEhaumy", // password123
    role: "admin",
    createdAt: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "user-1",
    name: "Regular Traveler",
    email: "user@stayfinder.com",
    passwordHash: "$2b$10$L5mVrtqOVWEcjKsDqCrGiuj4O7f42INMaPjH1B/L0P9S5CzEhaumy", // password123
    role: "user",
    createdAt: "2026-06-05T00:00:00.000Z"
  }
];

export function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const data: DBStructure = {
      users: initialUsers,
      listings: initialListings
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

export function getDB(): DBStructure {
  initDB();
  try {
    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Failed to read database file, returning default", error);
    return { users: initialUsers, listings: initialListings };
  }
}

export function saveDB(data: DBStructure) {
  initDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getListings: async (): Promise<Listing[]> => {
    const data = getDB();
    return data.listings;
  },

  getListingById: async (id: string): Promise<Listing | undefined> => {
    const data = getDB();
    return data.listings.find(item => item.id === id);
  },

  addListing: async (listing: Omit<Listing, 'id' | 'createdAt' | 'reviews' | 'rating'> & { id?: string }): Promise<Listing> => {
    const data = getDB();
    const newListing: Listing = {
      ...listing,
      id: listing.id || `stay-${Date.now()}`,
      rating: 5.0,
      reviews: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    data.listings.unshift(newListing);
    saveDB(data);
    return newListing;
  },

  deleteListing: async (id: string, ownerId: string, userRole?: string): Promise<boolean> => {
    const data = getDB();
    const index = data.listings.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    if (data.listings[index].ownerId !== ownerId && userRole !== 'admin') {
      throw new Error("Unauthorized to delete this listing");
    }

    data.listings.splice(index, 1);
    saveDB(data);
    return true;
  },

  getUserByEmail: async (email: string): Promise<User | undefined> => {
    const data = getDB();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    const data = getDB();
    return data.users.find(u => u.id === id);
  },

  addUser: async (name: string, email: string, passwordHash: string, role: 'user' | 'admin' = 'user'): Promise<User> => {
    const data = getDB();
    const exists = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("User already exists with this email");
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    saveDB(data);
    return newUser;
  }
};
