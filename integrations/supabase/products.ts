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

export interface ProductDetail extends Omit<Product, 'category' | 'subcategory'> {
  categories: { id: string; name: string; }[];
  subcategories: { id: string; name: string; }[];
}

export interface ProductVariationDetail extends ProductVariation {}

export interface ProductImageDetail {
  id: string;
  url: string;
  product_variation_id?: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  author: { full_name: string; };
}

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  main_image_url?: string;
  short_description?: string;
  average_rating?: number;
  category?: { id: string; name: string; };
}

export interface ProductPageData {
  product: ProductDetail;
  variations: ProductVariationDetail[];
  images: ProductImageDetail[];
  reviews: ProductReview[];
  similarProducts: StoreProduct[];
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

export const fetchStoreProductById = async (id: string): Promise<ProductPageData | null> => {
  const { data: product, error } = await sb
    .from("products")
    .select(
      `id, name, description, short_description, stock, price, compare_at_price, main_image_url, average_rating, review_count, brand, category:categories(id, name), categories:product_categories(category:categories(id, name)), subcategories:product_subcategories(subcategory:subcategories(id, name))`
    )
    .eq("id", id)
    .in("status", ["active", "out_of_stock"])
    .maybeSingle();
  if (error || !product) {
    return null;
  }

  // Transform the product data to flatten nested relations
  const transformedProduct = {
    ...product,
    categories: product.categories?.map((pc: any) => pc.category).filter(Boolean) || [],
    subcategories: product.subcategories?.map((ps: any) => ps.subcategory).filter(Boolean) || [],
  };

  const [variationsRes, imagesRes, reviewsRes] = await Promise.all([
    sb
      .from("product_variations")
      .select("id, name, price, stock, attributes")
      .eq("product_id", id),
    sb
      .from("product_images")
      .select("id, url, product_variation_id")
      .eq("product_id", id),
    sb
      .from("reviews")
      .select(
        "id, rating, title, content, image_url, created_at, author:profiles!user_id(full_name)"
      )
      .eq("product_id", id),
  ]);
  if (variationsRes.error) throw variationsRes.error;
  if (imagesRes.error) throw imagesRes.error;
  if (reviewsRes.error) throw reviewsRes.error;

  // Get similar products based on shared categories
  let similarProducts: StoreProduct[] = [];
  const productCategories = transformedProduct.categories;
  if (productCategories && productCategories.length > 0) {
    // Get product IDs that share categories with this product
    const categoryIds = productCategories.map((cat: any) => cat.id);
    const { data: similarProductIds, error: similarError } = await sb
      .from("product_categories")
      .select("product_id")
      .in("category_id", categoryIds)
      .neq("product_id", id);

    if (!similarError && similarProductIds && similarProductIds.length > 0) {
      const uniqueProductIds = [...new Set(similarProductIds.map((sp: any) => sp.product_id))];

      const { data: similarData } = await sb
        .from("products")
        .select(
          "id, name, price, main_image_url, short_description, average_rating, category:categories(id, name)"
        )
        .in("id", uniqueProductIds)
        .in("status", ["active", "out_of_stock"])
        .limit(6);

      similarProducts = similarData || [];
    }
  }

  return {
    product: transformedProduct as ProductDetail,
    variations: (variationsRes.data || []) as ProductVariationDetail[],
    images: (imagesRes.data || []) as ProductImageDetail[],
    reviews: (reviewsRes.data || []) as ProductReview[],
    similarProducts,
  };
};