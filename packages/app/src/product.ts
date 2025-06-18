export interface Product {
    id: string;
    name: string;
    price: number;
}

export const createProduct = (name: string, price: number): Product => ({
    id: `prod_${Math.random().toString(36).substr(2, 9)}`,
    name,
    price
});

export const validateProduct = (product: Product): boolean => {
    return product.name.length > 0 && product.price > 0;
};
