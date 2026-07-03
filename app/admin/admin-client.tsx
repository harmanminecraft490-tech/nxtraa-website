"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Save, X, Image as ImageIcon, Search, Upload, Trash2 } from "lucide-react";

type Product = {
  id: number;
  title: string;
  model: string;
  price: number;
  oldPrice: number;
  rating: number;
  badge: string;
  category: string;
  color: string;
  description: string;
  highlights: string[];
  imageUrls: string[];
};

const MAX_IMAGES = 3;

export default function AdminClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/products")
      .then(async (res) => {
        if (!res.ok || cancelled) {
          return;
        }

        const data = (await res.json()) as Product[];
        if (!cancelled) {
          setProducts(data);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch products:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setSaving(id);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
        showMessage("success", "Product updated successfully");
      } else {
        showMessage("error", "Failed to update product");
      }
    } catch {
      showMessage("error", "Error updating product");
    } finally {
      setSaving(null);
    }
  };

  const uploadImage = async (productId: number, file: File) => {
    setUploading(productId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", String(productId));

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, imageUrls: data.imageUrls } : p))
        );
        showMessage("success", "Image uploaded successfully");
      } else {
        const errorData = await res.json();
        showMessage("error", errorData.error || "Failed to upload image");
      }
    } catch {
      showMessage("error", "Error uploading image");
    } finally {
      setUploading(null);
    }
  };

  const deleteImage = async (productId: number, imageUrl: string) => {
    try {
      // We can't easily delete from client, so we'll just update the JSON
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: productId, 
          imageUrls: products.find(p => p.id === productId)?.imageUrls.filter(url => url !== imageUrl) || []
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, imageUrls: p.imageUrls.filter(url => url !== imageUrl) } : p))
        );
        showMessage("success", "Image deleted successfully");
      }
    } catch {
      showMessage("error", "Error deleting image");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.model.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.color.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-ink-950">Product Management</h1>
          <p className="mt-2 text-ink-500">
            Manage your products, update prices, and change images
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="text"
              placeholder="Search products by name, model, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-line bg-white py-3 pl-11 pr-4 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-ink-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl p-4 ${
              message.type === "success"
                ? "bg-signal-500/10 text-signal-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onUpdate={updateProduct}
              onUpload={uploadImage}
              onDeleteImage={deleteImage}
              saving={saving === product.id}
              uploading={uploading === product.id}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-ink-500">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onUpdate,
  onUpload,
  onDeleteImage,
  saving,
  uploading,
}: {
  product: Product;
  onUpdate: (id: number, updates: Partial<Product>) => void;
  onUpload: (id: number, file: File) => void;
  onDeleteImage: (productId: number, imageUrl: string) => void;
  saving: boolean;
  uploading: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    price: product.price,
    oldPrice: product.oldPrice,
    title: product.title,
    model: product.model,
    category: product.category,
    color: product.color,
    description: product.description,
    badge: product.badge,
  });

  const handleSave = () => {
    onUpdate(product.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      price: product.price,
      oldPrice: product.oldPrice,
      title: product.title,
      model: product.model,
      category: product.category,
      color: product.color,
      description: product.description,
      badge: product.badge,
    });
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(product.id, file);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="card-premium overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Image Preview */}
        <div className="shrink-0 lg:w-80">
          {/* Main Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-mist">
            {product.imageUrls.length > 0 ? (
                <Image
                  src={product.imageUrls[0]}
                  alt={product.title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon size={48} className="text-ink-300" />
              </div>
            )}
          </div>

          {/* Image Gallery - Show all uploaded images */}
          {product.imageUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {product.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-xl bg-mist"
                >
                  <Image
                    src={url}
                    alt={`${product.title} - ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                  <button
                    onClick={() => onDeleteImage(product.id, url)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    title="Delete image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              
              {/* Empty slots for remaining images */}
              {Array.from({ length: MAX_IMAGES - product.imageUrls.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-line bg-white"
                >
                  <span className="text-xs text-ink-300">+{index + 1}</span>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {product.imageUrls.length < MAX_IMAGES && (
            <div className="mt-3">
              <label
                htmlFor={`upload-${product.id}`}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white py-3 text-sm font-medium text-ink-600 transition hover:border-accent hover:text-accent"
              >
                {uploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                ) : (
                  <Upload size={16} />
                )}
                {uploading ? "Uploading..." : `Upload Image (${product.imageUrls.length}/${MAX_IMAGES})`}
              </label>
              <input
                id={`upload-${product.id}`}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-ink-950">{product.title}</h3>
              <p className="mt-1 text-sm text-ink-500">Model: {product.model}</p>
            </div>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
              {product.category}
            </span>
          </div>

          {isEditing ? (
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                    Price (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                    Old Price (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.oldPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, oldPrice: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  >
                    <option>Neckbands</option>
                    <option>Earbuds</option>
                    <option>Chargers</option>
                    <option>Cables</option>
                    <option>Power Banks</option>
                    <option>Speakers</option>
                    <option>Car Holders</option>
                    <option>Adapters</option>
                    <option>Screen Guards</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-ink-600">{product.description}</p>
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <span className="text-3xl font-black text-ink-950">
                    Rs. {product.price}
                  </span>
                  {product.oldPrice > product.price && (
                    <span className="ml-2 text-lg text-ink-400 line-through">
                      Rs. {product.oldPrice}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary mt-4"
              >
                Edit Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
