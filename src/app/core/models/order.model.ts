export interface Order {
  id: string;
  userId: string;
  orderDate: Date;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
}

export interface OrderDetail {
  id: string;
  userId: string;
  orderDate: Date;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  discountCode?: string;
  items: OrderItemDetail[];
}

export interface OrderItemDetail {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}