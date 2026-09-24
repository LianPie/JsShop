import content from "@/data/site-content.json";



export default function details() {
    return (<div className="mt-4 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        {/* Title */}
        <div className="border-b border-border bg-accent-soft px-6 py-6 md:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                {content.footer.about}
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {content.aboutus.title}
            </h1>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-10 p-6 md:grid-cols-2 md:p-10">
            {/* Image */}
            <div className="relative h-96 overflow-hidden rounded-xl">
                {/* Blurred background */}
                <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
                    alt=""
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                />

                {/* Actual image */}
                <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
                    alt={content.aboutus.title}
                    className="relative h-full w-full object-contain"
                />
            </div>

            {/* Description */}
            <div className="flex items-center">
                <div className="max-w-xl">
                    <h2 className="text-xl font-semibold text-primary">
                        {content.aboutus.title}
                    </h2>

                    <p className="mt-5 text-base leading-8 text-muted md:text-lg">
                        {content.aboutus.des}
                    </p>
                </div>
            </div>
        </div>
    </div>
    );
}