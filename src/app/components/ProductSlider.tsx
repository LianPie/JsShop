"use client";

import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import ProductCard from "./ProductCard";
import Loader from "./Loading";

type SliderInfo = {
    Name: string;
}
type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export default function ProductSlider({ Name }: SliderInfo) {
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

  return (<section className="w-full pb-16">
    <h2 className="mb-6 text-2xl font-semibold">
      {Name}
    </h2>

    {loading ? (
      <Loader />
    ) : (
      <div className="relative w-full">
        {/* Slider viewport */}
        <div className="w-full overflow-hidden">
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
        </div>

        <button
          onClick={() => scrollSlider("left")}
          className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          aria-label="Previous products"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <button
          onClick={() => scrollSlider("right")}
          className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          aria-label="Next products"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    )}
  </section>
  );
}