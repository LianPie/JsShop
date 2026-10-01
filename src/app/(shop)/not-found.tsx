import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faHouse, faBagShopping } from "@fortawesome/free-solid-svg-icons";
import content from "@/data/site-content.json";

// Shown whenever a page inside (shop) calls notFound(), e.g. an order that
// doesn't exist or isn't yours. It sits inside the shop layout, so the
// navbar and footer stay. Next sends the page with a 404 status.
export default function NotFound() {
    return (
        // Same look as the home page hero: soft background with decorative circles
        <section className="relative mt-6 mb-10 overflow-hidden rounded-2xl bg-accent-soft px-6 py-16 text-center sm:py-20">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent opacity-20" />
            <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-nav opacity-30" />

            <div className="relative flex flex-col items-center gap-3">
                {/* Icon in a white circle */}
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-surface shadow-md">
                    <FontAwesomeIcon
                        icon={faCompass}
                        // The "!" makes the size win over FontAwesome's own height: 1em
                        className="h-16! w-16! text-accent"
                    />
                </div>

                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                    404
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {content.notFound.title}
                </h1>
                <p className="max-w-md leading-7 text-muted">
                    {content.notFound.text}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <a
                        href="/"
                        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-hover"
                    >
                        <FontAwesomeIcon icon={faHouse} />
                        {content.notFound.home}
                    </a>
                    <a
                        href="/product"
                        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 font-medium transition hover:bg-background"
                    >
                        <FontAwesomeIcon icon={faBagShopping} />
                        {content.notFound.browse}
                    </a>
                </div>
            </div>
        </section>
    );
}
