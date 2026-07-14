import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { db, Listing } from './lib/db';
import { signToken, verifyToken, JWTPayload } from './lib/jwt';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client site (supports localhost, vercel deployments)
const allowedOrigins = [
  'http://localhost:3000',
  'https://stayfinder-client-alpha.vercel.app'
];

const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Parsers
app.use(express.json());
app.use(cookieParser());

// Custom request interface to store authenticated user
interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Middleware to authenticate user using JWT cookie
const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  req.user = decoded;
  next();
};

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Register User
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Save user
    const newUser = await db.addUser(name, email, passwordHash, role || 'user');

    // Create session
    const token = signToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    // Set secure HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });

  } catch (error: any) {
    console.error('Register API Error:', error);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login User
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create session
    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error: any) {
    console.error('Login API Error:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ user: null });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.json({ user: null });
  }

  // Refresh user data from DB
  const user = await db.getUserById(decoded.userId);
  if (!user) {
    return res.json({ user: null });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Logout User
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/'
  });
  return res.json({ message: 'Logged out successfully' });
});


// ==========================================
// 2. LISTINGS / PROPERTIES ENDPOINTS
// ==========================================

// Get All Listings (with search, category, pricing filters, pagination)
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string || '').toLowerCase();
    const category = req.query.category as string || 'All';
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice = parseFloat(req.query.maxPrice as string) || 999999;
    const minRating = parseFloat(req.query.minRating as string) || 0;
    const location = (req.query.location as string || '').toLowerCase();
    const sortBy = req.query.sortBy as string || 'createdAt';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    let listings = await db.getListings();

    // 1. Text Search Filter (Title / Descriptions / Location / Categories)
    if (search) {
      listings = listings.filter(item => 
        item.title.toLowerCase().includes(search) || 
        item.shortDescription.toLowerCase().includes(search) || 
        item.description.toLowerCase().includes(search) ||
        item.location.toLowerCase().includes(search)
      );
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      listings = listings.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // 3. Location Filter
    if (location) {
      listings = listings.filter(item => 
        item.location.toLowerCase().includes(location)
      );
    }

    // 4. Price Boundaries Filter
    listings = listings.filter(item => item.price >= minPrice && item.price <= maxPrice);

    // 5. Ratings Threshold Filter
    listings = listings.filter(item => item.rating >= minRating);

    // 6. Sorting Logical Layer
    if (sortBy === 'priceAsc') {
      listings.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      listings.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'ratingDesc') {
      listings.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: Sort by date created (newest first)
      listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 7. Pagination Bounds
    const total = listings.length;
    const startIndex = (page - 1) * limit;
    const paginatedListings = listings.slice(startIndex, startIndex + limit);

    return res.json({
      listings: paginatedListings,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });

  } catch (error: any) {
    console.error('Fetch Stays Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Get Listing Details by ID
app.get('/api/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await db.getListingById(id);
    if (!listing) {
      return res.status(404).json({ error: 'Property listing not found' });
    }

    // Fetch related listings (from same category, max 3, excluding current)
    const all = await db.getListings();
    const related = all
      .filter(item => item.category === listing.category && item.id !== listing.id)
      .slice(0, 3);

    return res.json({
      listing,
      related
    });

  } catch (error: any) {
    console.error('Fetch Stay Details Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Create Listing
app.post('/api/items', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { 
      title, 
      shortDescription, 
      description, 
      price, 
      location, 
      category, 
      dateAvailable, 
      imageUrl, 
      priority,
      specs 
    } = req.body;

    // Form Fields Validation
    if (!title || !shortDescription || !description || !price || !location || !category || !dateAvailable || !imageUrl) {
      return res.status(400).json({ error: 'Please fill in all required listing inputs' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }

    // Create listing
    const newListing = await db.addListing({
      title,
      shortDescription,
      description,
      price: parsedPrice,
      location,
      category,
      dateAvailable,
      imageUrl,
      images: [imageUrl],
      ownerId: user.userId,
      ownerName: user.name,
      priority: priority || 'medium',
      specs: specs || []
    });

    return res.status(201).json(newListing);

  } catch (error: any) {
    console.error('Create listing failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to register property listing' });
  }
});

// Delete Listing
app.delete('/api/items/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;

    // Attempt delete
    const success = await db.deleteListing(id, user.userId, user.role);
    if (!success) {
      return res.status(404).json({ error: 'Listing not found or deletion failed' });
    }

    return res.json({ message: 'Listing deleted successfully' });

  } catch (error: any) {
    console.error('Delete Listing API Error:', error);
    return res.status(403).json({ error: error.message || 'Unauthorized action' });
  }
});


// ==========================================
// 3. ANALYTICS / STATISTICS ENDPOINTS
// ==========================================

app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const listings = await db.getListings();

    if (listings.length === 0) {
      return res.json({
        totalCount: 0,
        averagePrice: 0,
        highPriorityCount: 0,
        categories: [],
        locations: []
      });
    }

    const totalCount = listings.length;
    const totalPrice = listings.reduce((sum, item) => sum + item.price, 0);
    const averagePrice = Math.round(totalPrice / totalCount);
    const highPriorityCount = listings.filter(item => item.priority === 'high').length;

    // Metrics by Categories
    const categoryGroups: { [key: string]: { count: number; totalPrice: number } } = {};
    listings.forEach(item => {
      if (!categoryGroups[item.category]) {
        categoryGroups[item.category] = { count: 0, totalPrice: 0 };
      }
      categoryGroups[item.category].count += 1;
      categoryGroups[item.category].totalPrice += item.price;
    });

    const categories = Object.keys(categoryGroups).map(cat => ({
      name: cat,
      count: categoryGroups[cat].count,
      avgPrice: Math.round(categoryGroups[cat].totalPrice / categoryGroups[cat].count)
    }));

    // Metrics by Top active Locations
    const locationGroups: { [key: string]: number } = {};
    listings.forEach(item => {
      const city = item.location.split(',').pop()?.trim() || item.location;
      locationGroups[city] = (locationGroups[city] || 0) + 1;
    });

    const locations = Object.keys(locationGroups).map(loc => ({
      name: loc,
      count: locationGroups[loc]
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return res.json({
      totalCount,
      averagePrice,
      highPriorityCount,
      categories,
      locations
    });

  } catch (error: any) {
    console.error('Stats aggregation failed:', error);
    return res.status(500).json({ error: 'Failed to aggregate stay statistics' });
  }
});

// Welcome / Root Endpoint
app.get('/', (req: Request, res: Response) => {
  return res.json({
    message: 'StayFinder Express API Server is running successfully!',
    environment: process.env.NODE_ENV || 'production',
    database: 'MongoDB Atlas (Connected)'
  });
});


// Start server locally (if not run by Vercel Serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[StayFinder Server] Running locally on http://localhost:${PORT}`);
  });
}

export default app;
