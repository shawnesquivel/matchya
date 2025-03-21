import Link from "next/link";
import Image from "next/image";

interface PromoCardProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bgColor?: string;
  textColor?: string;
  buttonStyle?: "primary" | "outline" | "underline";
  imageSrc?: string;
}

function PromoCard({
  title,
  description,
  ctaText,
  ctaLink,
  bgColor = "bg-beige-light",
  textColor = "text-mblack",
  buttonStyle = "primary",
  imageSrc,
}: PromoCardProps) {
  return (
    <div className={`${bgColor} rounded-lg sm:px-6 p-4 sm:py-8 py-6 border border-grey-light`}>
      <div className="flex flex-col">
        {imageSrc && (
          <div className="mb-4">
            <Image src={imageSrc} alt="" width={87} height={72} />
          </div>
        )}
        <h2 className={`text-3xl font-new-spirit font-light ${textColor} mb-3`}>{title}</h2>
        <p className="text-gray-700 mb-6">{description}</p>
        <a
          href={ctaLink}
          className={
            buttonStyle === "primary"
              ? "w-fit inline-block bg-green hover:bg-green-dark text-white py-2 px-6 rounded-full font-medium transition-colors duration-200"
              : "animated-link w-fit"
          }
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}

export default function DirectoryPromoCards({
  layout = "vertical",
}: {
  layout?: "vertical" | "horizontal";
}) {
  return (
    <div
      className={
        layout === "vertical"
          ? "flex flex-col space-y-6 sticky top-5"
          : "grid md:grid-cols-2 gap-8 mt-12"
      }
    >
      <PromoCard
        title="Still looking for your ideal therapist?"
        description="Our AI therapist finder was designed exactly for that! Just describe the kind of therapist you're searching for and Matchya's got you."
        ctaText="Start Your Search"
        ctaLink="/"
        buttonStyle="primary"
        imageSrc="/assets/images/matchya phone.svg"
      />

      <PromoCard
        title="Insurance Cost Calculator"
        description="Estimate your annual therapy costs based on your insurance benefits."
        ctaText="Budget Therapy Sessions"
        ctaLink="https://matchya.app/insurance-coverage-calculator/"
        bgColor="bg-white"
        buttonStyle="underline"
        imageSrc="/assets/images/matchya calculator.svg"
      />
    </div>
  );
}

// Export individual card component for more customization options
export { PromoCard };
