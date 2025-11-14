import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku?: string;
  stock: number;
  status: 'active' | 'draft' | 'out_of_stock';
  category_id?: string;
  subcategory_id?: string;
  category?: string;
  subcategory?: string;
  main_image_url?: string;
  featured: boolean;
  tags: string[];
  barcode?: string;
  brand?: string;
  dimensions?: string;
  cost_price?: number;
  continue_selling_when_oos: boolean;
  meta_description?: string;
  meta_title?: string;
  requires_shipping: boolean;
  short_description?: string;
  taxable: boolean;
  track_quantity: boolean;
  weight_kg?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name?: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProductBase {
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku?: string;
  stock: number;
  status: 'active' | 'draft' | 'out_of_stock';
  category_id?: string;
  subcategory_id?: string;
  main_image_url?: string;
  featured: boolean;
  tags: string[];
  barcode?: string;
  brand?: string;
  dimensions?: string;
  cost_price?: number;
  continue_selling_when_oos: boolean;
  meta_description?: string;
  meta_title?: string;
  requires_shipping: boolean;
  short_description?: string;
  taxable: boolean;
  track_quantity: boolean;
  weight_kg?: number;
}

export interface ProductQueryOptions {
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const fetchProductsPage = async (options: ProductQueryOptions) => {
  const {
    search,
    category,
    subcategory,
    minPrice,
    maxPrice,
    status,
    featured,
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options;

  let query = sb.from('products').select('*', { count: 'exact' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (category) {
    query = query.eq('category_id', category);
  }

  if (subcategory) {
    query = query.eq('subcategory_id', subcategory);
  }

  if (minPrice !== undefined) {
    query = query.gte('price', minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to).order(sortBy, { ascending: sortOrder === 'asc' });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    products: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    },
  };
};

export async function createProduct(product: ProductBase, variations?: ProductVariation[]): Promise<Product> {
  const { data, error } = await sb
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<ProductBase>): Promise<Product> {
  const { data, error } = await sb
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await sb
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as Product;
}