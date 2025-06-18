import { createUser } from '@test/shared/user';
import { createProduct } from '@test/shared/product';
import { createOrder, formatOrder } from './order';

export const processOrder = (
    userName: string,
    userEmail: string,
    productData: Array<{ name: string; price: number }>
) => {
    const user = createUser(userName, userEmail);
    const products = productData.map((p) => createProduct(p.name, p.price));
    const order = createOrder(user, products);

    console.log(formatOrder(order));
    return order;
};

const sampleOrder = processOrder('John Doe', 'john@example.com', [
    { name: 'Laptop', price: 999.99 },
    { name: 'Mouse', price: 29.99 }
]);

export default sampleOrder;
