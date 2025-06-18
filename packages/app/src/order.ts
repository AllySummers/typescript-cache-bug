import { type Product, validateProduct } from '@shared/product';
import type { User } from '@shared/user';
import { calculateTax, formatCurrency } from '@shared/utils';

export interface Order {
    id: string;
    user: User;
    products: Product[];
    subtotal: number;
    tax: number;
    total: number;
    createdAt: Date;
}

export const createOrder = (user: User, products: Product[]): Order => {
    const validProducts = products.filter(validateProduct);
    const subtotal = validProducts.reduce((sum, product) => sum + product.price, 0);
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    return {
        id: `order_${Math.random().toString(36).substr(2, 9)}`,
        user,
        products: validProducts,
        subtotal,
        tax,
        total,
        createdAt: new Date()
    };
};

export const formatOrder = (order: Order): string => {
    return `Order ${order.id} for ${order.user.name}: ${formatCurrency(order.total)}`;
};
