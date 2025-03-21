import React from "react";

interface PriceDisplayProps {
  label: string;
  price: number | null;
  currency?: string;
}

const PriceDisplay = ({ label, price, currency = "CAD" }: PriceDisplayProps) => {
  console.log("PriceDisplay:", { label, price, currency });

  return (
    <div className="mb-6">
      <h3 className="text-3xl text-grey-extraDark font-light mb-4">{label}</h3>
      <div className="rounded-xl border border-grey-light p-6 flex justify-between items-center">
        {price && price > 0 ? (
          <>
            <div className="bg-beige-light rounded-lg px-4 py-2">
              <span className="text-2xl text-grey-extraDark">
                ${price} {currency}
              </span>
            </div>
            <span className="text-2xl text-grey-extraDark">/ session</span>
          </>
        ) : (
          <span className="text-sm text-grey-extraDark">Information not available</span>
        )}
      </div>
    </div>
  );
};

export default PriceDisplay;
