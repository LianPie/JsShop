import Image from "next/image";

type FooterProps = {
  siteName: string;
  footer: {
    about: string;
    contactname1: string;
    contactname2: string;
    contactnumber1: string;
    contactnumber2: string;
  };
};

export default function Footer({ siteName, footer }: FooterProps) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-2">

        {/* Left column */}
        <div>
          <h2 className="text-2xl font-semibold">
            {siteName}
          </h2>

          <div className="mt-6 space-y-4">
            <div>
              <p className="font-medium">{footer.contactname1}</p>
              <p className="text-sm text-muted">
                {footer.contactnumber1}
              </p>
            </div>

            <div>
              <p className="font-medium">{footer.contactname2}</p>
              <p className="text-sm text-muted">
                {footer.contactnumber2}
              </p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex items-start justify-between gap-8">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold">
              About
            </h3>

            <p className="mt-3 text-sm leading-6 text-muted">
              {footer.about}
            </p>
          </div>

          <Image
            src="/favicon.ico"
            alt="Shop logo"
            width={100}
            height={100}
            className="shrink-0"
          />
        </div>

      </div>
    </footer>
  );
}