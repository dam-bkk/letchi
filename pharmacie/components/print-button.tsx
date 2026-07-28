"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" className="btn-primary" onClick={() => window.print()}>
      <Printer size={14} /> Print
    </button>
  );
}
