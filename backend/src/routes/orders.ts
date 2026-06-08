import { Router } from 'express';
import { supabase } from '../config/db.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { protect, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Create order
router.post(
  '/',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { items, total, address, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      throw new AppError(400, 'Order must contain items.');
    }

    if (!address || !paymentMethod) {
      throw new AppError(400, 'Address and payment method are required.');
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user!.sub,
        order_number: orderNumber,
        total_amount: total,
        delivery_charge: 0,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'upi' || paymentMethod === 'razorpay' ? 'pending' : 'completed',
        address_snapshot: address,
      })
      .select()
      .single();

    if (orderError) {
      throw new AppError(500, 'Failed to create order.');
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      weight: item.weight,
      quantity: item.qty,
      unit_price: item.offerPrice,
      total_price: item.offerPrice * item.qty,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new AppError(500, 'Failed to create order items.');
    }

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully.',
      data: {
        order: {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          status: order.status,
        },
      },
    });
  })
);

// Get user orders
router.get(
  '/',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { data: orders, count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.sub)
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

// Get single order
router.get(
  '/:id',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.sub)
      .single();

    if (error || !order) {
      throw new AppError(404, 'Order not found.');
    }

    // Get order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    res.json({
      status: 'success',
      data: {
        order: {
          ...order,
          items: items || [],
        },
      },
    });
  })
);

// Cancel order
router.post(
  '/:id/cancel',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const { data: order } = await supabase
      .from('orders')
      .select('status')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.sub)
      .single();

    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new AppError(400, 'Order cannot be cancelled in current status.');
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date() })
      .eq('id', req.params.id);

    if (error) {
      throw new AppError(500, 'Failed to cancel order.');
    }

    res.json({
      status: 'success',
      message: 'Order cancelled successfully.',
    });
  })
);

export default router;
