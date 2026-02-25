export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
  isActive?: boolean;
}