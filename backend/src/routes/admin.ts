import { Router } from 'express';
import { supabase } from '../config/db.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { protect, adminOnly, AuthRequest } from '../middleware/auth.js';
import { validateProductName, validateDescription, validatePrice } from '../utils/validators.js';

const router = Router();

// Admin middleware
router.use(protect, adminOnly);

// =====================
// PRODUCT MANAGEMENT
// =====================

// Create product
router.post(
  '/products',
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, category, weight, mrp, selling_price, offer_price, description, benefits, images, emoji, status, featured, stock_quantity } = req.body;

    // Validate
    if (!validateProductName(name)) {
      throw new AppError(400, 'Product name must be 3-255 characters.');
    }

    if (!validateDescription(description)) {
      throw new AppError(400, 'Description must be 10-2000 characters.');
    }

    if (!validatePrice(mrp) || !validatePrice(selling_price) || !validatePrice(offer_price)) {
      throw new AppError(400, 'Invalid pricing.');
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        category,
        weight,
        mrp,
        selling_price,
        offer_price,
        description,
        benefits,
        images,
        emoji,
        status: status || 'active',
        featured: featured || false,
        stock_quantity: stock_quantity || 0,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to create product.');
    }

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully.',
      data: { product },
    });
  })
);

// Update product
router.put(
  '/products/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const updates = req.body;

    const { data: product, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to update product.');
    }

    res.json({
      status: 'success',
      message: 'Product updated successfully.',
      data: { product },
    });
  })
);

// Delete product
router.delete(
  '/products/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw new AppError(500, 'Failed to delete product.');
    }

    res.json({
      status: 'success',
      message: 'Product deleted successfully.',
    });
  })
);

// =====================
// ORDER MANAGEMENT
// =====================

// Get all orders
router.get(
  '/orders',
  asyncHandler(async (req: AuthRequest, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data: orders, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(500, 'Failed to fetch orders.');
    }

    res.json({
      status: 'success',
      data: {
        orders: orders || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
    });
  })
);

// Update order status
router.put(
  '/orders/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const { status } = req.body;

    if (!status) {
      throw new AppError(400, 'Status is required.');
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to update order.');
    }

    res.json({
      status: 'success',
      message: 'Order status updated.',
      data: { order },
    });
  })
);

// =====================
// ANALYTICS
// =====================

// Dashboard stats
router.get(
  '/analytics/dashboard',
  asyncHandler(async (req: AuthRequest, res) => {
    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'completed');

    const totalRevenue = (revenueData || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Active products
    const { count: activeProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total customers
    const { count: totalCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    res.json({
      status: 'success',
      data: {
        stats: {
          totalOrders: totalOrders || 0,
          totalRevenue,
          activeProducts: activeProducts || 0,
          totalCustomers: totalCustomers || 0,
        },
      },
    });
  })
);

export default router;
