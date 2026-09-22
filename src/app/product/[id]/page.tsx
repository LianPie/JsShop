"use client";

import content from "@/data/site-content.json";
import Loader from "../../components/Loader";
import { useEffect, useState, use } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";


interface PageProps {
    params: Promise<{ id: string }>;
}
type Product = {
    id: number;
    name: string;
    price: number;
    image: string;
};

export default function details({ params }: PageProps) {

    const [product, setProduct] = useState<Product>();
    const [loading, setLoading] = useState(true);

    const { id } = use(params);
    const productId = Number(id);
    useEffect(() => {
        fetch(`http://localhost:3001/api/products/details?id=${productId}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <Loader />;
    } return (
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm mt-2">
            {/* Title */}
            <div className="border-b border-border bg-accent-soft px-6 py-5">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {content.products["product-pagetitle"]} {product?.name}
                </h1>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-10 p-6 md:grid-cols-2 md:p-8">
                {/* Image */}
                <div className="h-96 overflow-hidden rounded-xl bg-accent-soft">
                    <img
                        src={product?.image}
                        alt={product?.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <div className="space-y-5">
                        <div>
                            <p className="text-sm font-medium uppercase tracking-wider text-muted">
                                {content.products.title}
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-foreground">
                                {product?.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium uppercase tracking-wider text-muted">
                                {content.products.price}
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-primary">
                                ${product?.price}
                            </p>
                        </div>
                    </div>

                    {/* Add to cart */}
                    <button
                        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-white transition hover:bg-primary-hover"
                    >
                        <FontAwesomeIcon icon={faCartShopping} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}