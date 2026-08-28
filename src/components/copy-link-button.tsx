"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-5 font-semibold transition-colors hover:bg-muted ease-soft"
    >
      <Link2 size={14} />
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
