import ProductSlider from "./components/ProductSlider";
import content from "@/data/site-content.json";


export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-accent-soft px-8 py-16 sm:px-12 sm:py-20 mt-10">
        {/* Decorative shapes */}
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent opacity-20" />
        <div className="absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-nav opacity-30" />

        <div className="relative max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Welcome
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {content.home.title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            {content.home.desc}
          </p>

          <button className="mt-8 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-hover">
            Explore Products
          </button>
        </div>
      </section>

      <div className="mt-14">
        <ProductSlider
          Name={content.home.bestselling} />
      </div>

    </>
  );
}
