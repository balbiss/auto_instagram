import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/icon-512.png"
      alt="Auto Instagram"
      className={cn("size-14 shrink-0 object-contain", className)}
    />
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/auto-instagram-logo.png"
      alt="Auto Instagram"
      className={cn("h-16 w-auto object-contain", className)}
    />
  );
}
