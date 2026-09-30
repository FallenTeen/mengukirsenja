import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/mainlogo.PNG"
      alt="Mengukir Senja Decoration"
      width={1165}
      height={1165}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}