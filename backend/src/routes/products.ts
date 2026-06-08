import { Router } from 'express';
import { supabase } from '../config/db.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get all products with filters
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    let query = supabase.from('products').select('*');

    // Filters
    if (req.query.category) {
      query = query.eq('category', req.query.category);
    }

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    if (req.query.featured === 'true') {
      query = query.eq('featured', true);
    }

    // Search
    if (req.query.search) {
      const searchTerm = `%${req.query.search}%`;
      query = query.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy as string || 'created_at';
    const order = req.query.order === 'asc' ? false : true;
    query = query.order(sortBy, { ascending: !order });

    // Execute query
    const { data: products, count, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(500, 'Failed to fetch products.');
    }

    res.json({
      status: 'success',
      data: {
        products,
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

// Get single product
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      throw new AppError(404, 'Product not found.');
    }

    res.json({
      status: 'success',
      data: { product },
    });
  })
);

// Get featured products
router.get(
  '/featured/list',
  asyncHandler(async (req, res) => {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .eq('status', 'active')
      .limit(8);

    if (error) {
      throw new AppError(500, 'Failed to fetch featured products.');
    }

    res.json({
      status: 'success',
      data: { products },
    });
  })
);

export default router;
