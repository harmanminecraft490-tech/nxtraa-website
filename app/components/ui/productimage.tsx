import Image from "next/image";
import { cn } from "../lib/utils";

type ProductImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  hover?: boolean;
};

const sizePadding = {
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

export default function ProductImage({
  src,
  alt,
  priority = false,
  size = "md",
  className,
  hover = false,
}: ProductImageProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#f4f8fa]",
        sizePadding[size],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={900}
        height={900}
        priority={priority}
        className={cn(
          "h-full w-full object-contain object-center",
          hover && "transition duration-500 group-hover:scale-[1.03]",
        )}
      />
    </div>
  );
}
