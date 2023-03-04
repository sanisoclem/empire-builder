import { VFC } from "react";

export const Footer: VFC = () => (
  <footer className="mt-20 mb-4">
    <p className="text-center text-sm text-slate-500">
      Copyright © {new Date().getFullYear()} Empire Builder. All rights
      reserved.
    </p>
  </footer>
);
