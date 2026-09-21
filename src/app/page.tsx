import MostBought from "./components/MostBought";
import content from "@/data/site-content.json";


export default function Home() {
  return (
    <>
      <section className="py-16">
        <h1 className="text-4xl font-semibold">
          {content.home.title}
        </h1>

        <p className="mt-4 max-w-2xl text-muted">
          {content.home.desc}
        </p>
      </section>

      <MostBought />
    </>
  );
}
