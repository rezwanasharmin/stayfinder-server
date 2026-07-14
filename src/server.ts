import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { db } from './lib/db';
import { signToken, verifyToken, JWTPayload } from './lib/jwt';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser());

// Register User
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const newUser = await db.addUser(name, email, passwordHash, role || 'user');
    const token = signToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(201).json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error: any) {
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
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) return res.json({ user: null });
  const decoded = verifyToken(token);
  if (!decoded) return res.json({ user: null });
  const user = await db.getUserById(decoded.userId);
  if (!user) return res.json({ user: null });
  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// Logout User
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });
  return res.json({ message: 'Logged out successfully' });
});

app.listen(PORT, () => {
  console.log(`[StayFinder Server] Running on http://localhost:${PORT}`);
});
