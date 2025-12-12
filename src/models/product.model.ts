export type InventoryStatus = "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";

export type Product = {
    id: number;
    code: string;
    name: string;
    description: string;
    image: string;
    category: string;
    price: number;
    quantity: number;
    internalReference: string;
    shellId: number;
    inventoryStatus: InventoryStatus;
    rating: number;
    createdAt: number;
    updatedAt: number;
};
