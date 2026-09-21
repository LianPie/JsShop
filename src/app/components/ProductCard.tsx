import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCartShopping } from "@fortawesome/free-solid-svg-icons";


type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group w-64 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <button
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 transition hover:text-red-500"
          aria-label="Add to favorites"
        >
          ♡
        </button>
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold text-gray-900">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <span className="text-yellow-500">★</span>
          <span>4.8</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-700"
            aria-label={`Add ${product.name} to cart`}
          >
            <FontAwesomeIcon
              icon={faCartShopping}
              className="h-4 w-4"
            />
          </button>
        </div>
      </div>
    </div>
  );
}