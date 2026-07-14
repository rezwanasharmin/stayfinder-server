import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';

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
      { label: "Guest Limit", value: "2 Guests" },
      { label: "Beds", value: "1 King Bed" },
      { label: "Wi-Fi", value: "Free High-Speed Wi-Fi" },
      { label: "Availability", value: "Booking Window Open" }
    ],
    createdAt: "2026-07-01"
  },
  {
    id: "stay-2",
    title: "Eco Pine Wood Loft Cabin",
    shortDescription: "A minimalist A-frame wooden cabin surrounded by high alpine pines.",
    description: "A gorgeous architectural A-frame pine wood cabin designed for couples or small families seeking mountain solitude. Features high vaulted ceilings, modern Scandinavian decor, wood-fired hot tub, internal reading loft, and direct private forest trail access.",
    price: 180,
    rating: 4.7,
    location: "Sajek Valley, Rangamati",
    category: "Cabins",
    dateAvailable: "2026-08-10",
    imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80"
    ],
    ownerId: "admin-1",
    ownerName: "StayFinder Elite",
    reviews: [],
    priority: "medium",
    specs: [
      { label: "Guest Limit", value: "4 Guests" },
      { label: "Beds", value: "2 Queen Beds" },
      { label: "Wi-Fi", value: "Limited/Nature Retreat" },
      { label: "Availability", value: "Instant Booking" }
    ],
    createdAt: "2026-07-03"
  },
  {
    id: "stay-3",
    title: "Infinity Edge Glass Villa Mansion",
    shortDescription: "Ultramodern glass design villa overlooking serene mountain valleys.",
    description: "Experience premium architectural luxury in this structural glass mansion. Features clean modern lines, floor-to-ceiling glass panel walls, state-of-the-art kitchen, custom lighting automation, private home theater room, and a massive heated infinity-edge swimming pool overlooking the hills.",
    price: 550,
    rating: 5.0,
    location: "Sylhet, Bangladesh",
    category: "Mansions",
    dateAvailable: "2026-07-25",
    imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
    ],
    ownerId: "admin-1",
    ownerName: "StayFinder Elite",
    reviews: [
      { id: "rev-3", userName: "Imtiaz Ahmed", rating: 5, comment: "Hands down the best stay in the country. Absolutely premium experience and flawless hospitality.", date: "2026-07-08" }
    ],
    priority: "high",
    specs: [
      { label: "Guest Limit", value: "8 Guests" },
      { label: "Beds", value: "4 King Beds" },
      { label: "Wi-Fi", value: "Gigabit Ethernet Fiber" },
      { label: "Availability", value: "Instant Approval" }
    ],
    createdAt: "2026-07-05"
  }
];

// Default preseeded users
const initialUsers: User[] = [
  {
    id: "admin-1",
    name: "StayFinder Administrator",
    email: "admin@stayfinder.com",
    // Compatible bcrypt hash for: 'stayfinderAdmin2026!'
    passwordHash: "$2a$10$b0ngiA6a7HjmULWC/QGqoen1MIX95NUlUFmqazFpoXaW8imw9cXvi",
    role: "admin",
    createdAt: "2026-07-01T00:00:00.000Z"
  },
  {
    id: "usr-1",
    name: "Regular Traveler",
    email: "user@stayfinder.com",
    // Compatible bcrypt hash for: 'password123'
    passwordHash: "$2b$10$Uq.Gz7fO0P.29LgK9hWnruwV5t3KSwx044.f7Zz70o21mUe.a5Kmq",
    role: "user",
    createdAt: "2026-07-02T00:00:00.000Z"
  }
];

// Helper: Ensure the local data directory and database file exist
export function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialDB: DBStructure = {
      users: initialUsers,
      listings: initialListings
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
  }
}

// Helper: Read from local db file
export function getDB(): DBStructure {
  initDB();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Helper: Save to local db file
export function saveDB(data: DBStructure) {
  initDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ==========================================
// MONGODB ATLAS IMPLEMENTATION LAYER
// ==========================================

let mongoClient: MongoClient | null = null;
let isConnected = false;
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = 'stayfinder';

async function getMongoClient(): Promise<MongoClient> {
  if (mongoClient && isConnected) {
    return mongoClient;
  }
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environments');
  }
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  isConnected = true;
  console.log('[StayFinder Server] Successfully connected to live MongoDB Atlas!');
  
  // Seed MongoDB collections asynchronously if they are empty
  seedMongoIfEmpty().catch(err => console.error('[StayFinder Server] Seeding error:', err));
  
  return mongoClient;
}

function useMongo(): boolean {
  return !!MONGODB_URI && !MONGODB_URI.includes('xxxx.mongodb.net') && MONGODB_URI.startsWith('mongodb');
}

async function getCollection(name: 'users' | 'listings') {
  const client = await getMongoClient();
  return client.db(dbName).collection(name);
}

async function seedMongoIfEmpty() {
  try {
    const client = await getMongoClient();
    const db = client.db(dbName);
    
    // Seed users collection
    const usersCol = db.collection('users');
    const userCount = await usersCol.countDocuments();
    if (userCount === 0) {
      console.log('[StayFinder Server] MongoDB Atlas users collection is empty. Seeding from db.json...');
      const localData = getDB();
      if (localData.users.length > 0) {
        await usersCol.insertMany(localData.users);
        console.log('[StayFinder Server] Seeded users collection on Atlas.');
      }
    }

    // Force update preseeded admin password hash on start
    const adminNewHash = "$2a$10$b0ngiA6a7HjmULWC/QGqoen1MIX95NUlUFmqazFpoXaW8imw9cXvi";
    await usersCol.updateOne(
      { email: 'admin@stayfinder.com' },
      { $set: { passwordHash: adminNewHash } }
    );

    // Sync local db.json if it exists
    if (fs.existsSync(DB_FILE)) {
      try {
        const localData = getDB();
        const adminIdx = localData.users.findIndex(u => u.email === 'admin@stayfinder.com');
        if (adminIdx !== -1) {
          localData.users[adminIdx].passwordHash = adminNewHash;
          saveDB(localData);
        }
      } catch (e) {
        console.error('[StayFinder Server] Sync local db admin hash error:', e);
      }
    }
    
    // Seed listings collection
    const listingsCol = db.collection('listings');
    const listingCount = await listingsCol.countDocuments();
    if (listingCount === 0) {
      console.log('[StayFinder Server] MongoDB Atlas listings collection is empty. Seeding from db.json...');
      const localData = getDB();
      if (localData.listings.length > 0) {
        await listingsCol.insertMany(localData.listings);
        console.log('[StayFinder Server] Seeded listings collection on Atlas.');
      }
    }
  } catch (err) {
    console.error('[StayFinder Server] Seeding live MongoDB collection failed:', err);
  }
}

// ==========================================
// EXPOSED DATABASE CRUD METHODS
// ==========================================

export const db = {
  getListings: async (): Promise<Listing[]> => {
    if (useMongo()) {
      try {
        const col = await getCollection('listings');
        const list = await col.find({}).toArray();
        return list.map(item => ({
          ...item,
          id: item.id || item._id.toString()
        })) as any;
      } catch (err) {
        console.error('Mongo getListings failed, using local fallback:', err);
      }
    }
    const data = getDB();
    return data.listings;
  },

  getListingById: async (id: string): Promise<Listing | undefined> => {
    if (useMongo()) {
      try {
        const col = await getCollection('listings');
        let item = await col.findOne({ id: id });
        if (!item && ObjectId.isValid(id)) {
          item = await col.findOne({ _id: new ObjectId(id) });
        }
        if (item) {
          return {
            ...item,
            id: item.id || item._id.toString()
          } as any;
        }
      } catch (err) {
        console.error('Mongo getListingById failed, using local fallback:', err);
      }
    }
    const data = getDB();
    return data.listings.find(item => item.id === id);
  },

  addListing: async (listing: Omit<Listing, 'id' | 'createdAt' | 'reviews' | 'rating'> & { id?: string }): Promise<Listing> => {
    const newListing: Listing = {
      ...listing,
      id: listing.id || `stay-${Date.now()}`,
      rating: 5.0,
      reviews: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    if (useMongo()) {
      try {
        const col = await getCollection('listings');
        const res = await col.insertOne(newListing);
        return {
          ...newListing,
          id: newListing.id || res.insertedId.toString()
        };
      } catch (err) {
        console.error('Mongo addListing failed, using local fallback:', err);
      }
    }
    const data = getDB();
    data.listings.unshift(newListing);
    saveDB(data);
    return newListing;
  },

  deleteListing: async (id: string, ownerId: string, userRole?: string): Promise<boolean> => {
    if (useMongo()) {
      try {
        const col = await getCollection('listings');
        let item = await col.findOne({ id: id });
        if (!item && ObjectId.isValid(id)) {
          item = await col.findOne({ _id: new ObjectId(id) });
        }
        if (!item) return false;
        
        if (item.ownerId !== ownerId && userRole !== 'admin') {
          throw new Error("Unauthorized to delete this listing");
        }

        const deleteRes = await col.deleteOne({ _id: item._id });
        return deleteRes.deletedCount > 0;
      } catch (err: any) {
        console.error('Mongo deleteListing failed:', err);
        if (err.message && err.message.includes("Unauthorized")) {
          throw err;
        }
      }
    }
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
    if (useMongo()) {
      try {
        const col = await getCollection('users');
        const user = await col.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (user) {
          return {
            ...user,
            id: user.id || user._id.toString()
          } as any;
        }
      } catch (err) {
        console.error('Mongo getUserByEmail failed, using local fallback:', err);
      }
    }
    const data = getDB();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    if (useMongo()) {
      try {
        const col = await getCollection('users');
        let user = await col.findOne({ id: id });
        if (!user && ObjectId.isValid(id)) {
          user = await col.findOne({ _id: new ObjectId(id) });
        }
        if (user) {
          return {
            ...user,
            id: user.id || user._id.toString()
          } as any;
        }
      } catch (err) {
        console.error('Mongo getUserById failed, using local fallback:', err);
      }
    }
    const data = getDB();
    return data.users.find(u => u.id === id);
  },

  addUser: async (name: string, email: string, passwordHash: string, role: 'user' | 'admin' = 'user'): Promise<User> => {
    if (useMongo()) {
      try {
        const col = await getCollection('users');
        const exists = await col.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
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
        const res = await col.insertOne(newUser);
        return {
          ...newUser,
          id: newUser.id || res.insertedId.toString()
        };
      } catch (err: any) {
        console.error('Mongo addUser failed:', err);
        if (err.message && err.message.includes("already exists")) {
          throw err;
        }
      }
    }
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
