import { getProducts } from "../lib/products";
import ProductCard from "./product-card";

export default function FeaturedProducts() {
  // Fetch a selection of products to feature.
  // Here we take the first 8 products as an example.
  const featuredProducts = getProducts().slice(0, 8);

  return (
    <section className="w-full bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
            Featured Products
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-ink-600 sm:text-lg">
            Discover our top-rated accessories, loved by customers across India.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} productId={product.id} />
          ))}
        </div>
      </div>
    </section>
  );
}