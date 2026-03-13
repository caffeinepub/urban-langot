import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ProductId = bigint;
export interface CartProduct {
    quantity: bigint;
    product: Product;
}
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    rating: bigint;
    price: bigint;
}
export interface backendInterface {
    addToCart(productId: ProductId): Promise<void>;
    clearCart(): Promise<void>;
    getCart(): Promise<Array<CartProduct>>;
    getProducts(): Promise<Array<Product>>;
    removeFromCart(productId: ProductId): Promise<void>;
}
