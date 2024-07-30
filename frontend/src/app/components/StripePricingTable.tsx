"use client";

import React, { useEffect, useRef } from "react";

interface StripePricingTableProps {
  pricingTableId: string;
  publishableKey: string;
  clientReferenceId: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const StripePricingTable: React.FC<StripePricingTableProps> = ({
  pricingTableId,
  publishableKey,
  clientReferenceId,
}) => {
  const tableRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.setAttribute("pricing-table-id", pricingTableId);
      tableRef.current.setAttribute("publishable-key", publishableKey);
      tableRef.current.setAttribute("client-reference-id", clientReferenceId);
    }
  }, [pricingTableId, publishableKey]);

  return <stripe-pricing-table ref={tableRef} />;
};

export default StripePricingTable;
