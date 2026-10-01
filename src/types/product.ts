export type Product = {
  id: number;
  name: string;
  price: number;
  boughtCount: number;
  image: string;
};
// What's stored in the cart cookie: only ids and quantities.
// Names and prices are looked up in the database when the cart is shown.
export type CartItem = {
  id: number;
  quantity: number;
};
export type Cart = {
  products: CartItem[];
};

export type CartProduct = Product & { quantity: number };