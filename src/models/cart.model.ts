export type CartItem = {
    productId: number;
    quantity: number;
};

export type Cart = {
    userId: string;
    items: CartItem[];
    updatedAt: number;
};
