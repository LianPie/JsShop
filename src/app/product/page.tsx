import ProductsGrid from "../../components/ProductsGrid";
import content from "@/data/site-content.json";

export default function ProductsPage() {
  return (
    <main className="py-12">
      <h1 className="text-3xl font-semibold">
        {content.products.pagetitle}
      </h1>

      <p className="mt-2 text-muted">
        {content.products.explore}
      </p>

      <ProductsGrid />
    </main>
  );
}