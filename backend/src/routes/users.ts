import { Router } from 'express';
import { supabase } from '../config/db.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { protect, AuthRequest } from '../middleware/auth.js';
import { validatePhone } from '../utils/validators.js';

const router = Router();

// Get user profile
router.get(
  '/profile',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone, role, created_at, updated_at')
      .eq('id', req.user!.sub)
      .single();

    if (error || !user) {
      throw new AppError(404, 'User not found.');
    }

    res.json({
      status: 'success',
      data: { user },
    });
  })
);

// Update profile
router.put(
  '/profile',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
      throw new AppError(400, 'Name and phone are required.');
    }

    if (!validatePhone(phone)) {
      throw new AppError(400, 'Invalid phone number.');
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ name, phone, updated_at: new Date() })
      .eq('id', req.user!.sub)
      .select('id, email, name, phone, role')
      .single();

    if (error) {
      throw new AppError(500, 'Failed to update profile.');
    }

    res.json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: { user },
    });
  })
);

// Get all addresses
router.get(
  '/addresses',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user!.sub)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(500, 'Failed to fetch addresses.');
    }

    res.json({
      status: 'success',
      data: { addresses: addresses || [] },
    });
  })
);

// Create address
router.post(
  '/addresses',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, phone, address, city, state, pincode, landmark } = req.body;

    if (!name || !phone || !address || !city || !state || !pincode) {
      throw new AppError(400, 'All address fields are required.');
    }

    if (!validatePhone(phone)) {
      throw new AppError(400, 'Invalid phone number.');
    }

    const { data: newAddress, error } = await supabase
      .from('addresses')
      .insert({
        user_id: req.user!.sub,
        name,
        phone,
        address,
        city,
        state,
        pincode,
        landmark,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to create address.');
    }

    res.status(201).json({
      status: 'success',
      message: 'Address created successfully.',
      data: { address: newAddress },
    });
  })
);

// Update address
router.put(
  '/addresses/:id',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, phone, address, city, state, pincode, landmark } = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.sub)
      .maybeSingle();

    if (!existing) {
      throw new AppError(404, 'Address not found.');
    }

    const { data: updatedAddress, error } = await supabase
      .from('addresses')
      .update({ name, phone, address, city, state, pincode, landmark, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to update address.');
    }

    res.json({
      status: 'success',
      message: 'Address updated successfully.',
      data: { address: updatedAddress },
    });
  })
);

// Delete address
router.delete(
  '/addresses/:id',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    // Verify ownership
    const { data: existing } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.sub)
      .maybeSingle();

    if (!existing) {
      throw new AppError(404, 'Address not found.');
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw new AppError(500, 'Failed to delete address.');
    }

    res.json({
      status: 'success',
      message: 'Address deleted successfully.',
    });
  })
);

export default router;
