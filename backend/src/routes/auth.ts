import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { protect, AuthRequest } from '../middleware/auth.js';
import { validateEmail, validatePhone } from '../utils/validators.js';

const router = Router();

// Generate JWT tokens
const generateTokens = (userId: string, email: string, name: string, role: string) => {
  const accessToken = jwt.sign(
    { sub: userId, email, name, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

// Register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name || !phone) {
      throw new AppError(400, 'Email, password, name, and phone are required.');
    }

    if (!validateEmail(email)) {
      throw new AppError(400, 'Invalid email format.');
    }

    if (password.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters.');
    }

    if (!validatePhone(phone)) {
      throw new AppError(400, 'Invalid phone number.');
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new AppError(409, 'Email already registered.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        phone,
        password_hash: hashedPassword,
        role: 'customer',
      })
      .select('id, email, name, role')
      .single();

    if (error) {
      throw new AppError(500, 'Failed to create user.');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.name,
      user.role
    );

    // Store refresh token
    await supabase.from('jwt_refresh_tokens').insert({
      user_id: user.id,
      token_hash: await bcrypt.hash(refreshToken, 10),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  })
);

// Login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required.');
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, password_hash, role')
      .eq('email', email)
      .maybeSingle();

    if (!user || error) {
      throw new AppError(401, 'Invalid email or password.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password.');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.name,
      user.role
    );

    // Store refresh token
    await supabase.from('jwt_refresh_tokens').insert({
      user_id: user.id,
      token_hash: await bcrypt.hash(refreshToken, 10),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  })
);

// Refresh Token
router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token is required.');
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        sub: string;
      };

      // Verify refresh token exists in DB
      const { data: tokenRecord } = await supabase
        .from('jwt_refresh_tokens')
        .select('id')
        .eq('user_id', decoded.sub)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!tokenRecord) {
        throw new AppError(401, 'Invalid refresh token.');
      }

      // Get user details
      const { data: user } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('id', decoded.sub)
        .single();

      if (!user) {
        throw new AppError(401, 'User not found.');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user.id,
        user.email,
        user.name,
        user.role
      );

      res.json({
        status: 'success',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error: any) {
      throw new AppError(401, 'Invalid refresh token.');
    }
  })
);

// Get current user
router.get(
  '/me',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, phone, role, created_at')
      .eq('id', req.user!.sub)
      .single();

    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    res.json({
      status: 'success',
      data: { user },
    });
  })
);

export default router;
