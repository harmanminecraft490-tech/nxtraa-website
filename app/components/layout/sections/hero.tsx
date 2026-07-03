import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full">
      <Image
        src="/home-banners/home1.jpeg"
        alt="Nxteraa Banner"
        width={1920}
        height={700}
        priority
        className="w-full h-auto object-cover"
      />
    </section>
  );
}
