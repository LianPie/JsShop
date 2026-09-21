"use client";

import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import ProductCard from "./ProductCard";
import Loader from "./Loading";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export default function MostBought() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "right" ? 300 : -300,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    fetch("http://localhost:3001/api/products/most-bought")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="pb-16">
      <h2 className="mb-6 text-2xl font-semibold">
        Most Bought
      </h2>

      {loading ? (
        <Loader />
      ) : (
        <div className="relative">
          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {/* Slider arrows */}
          <button
            onClick={() => scrollSlider("left")}
            className="absolute -left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
            aria-label="Previous products"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
          </button>

          <button
            onClick={() => scrollSlider("right")}
            className="absolute -right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
            aria-label="Next products"
          >
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}