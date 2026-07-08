  "use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Save, X, Image as ImageIcon, Search, Upload, Trash2 } from "lucide-react";

import { categories, type Product } from "@/app/components/lib/product-types";

// Selectable categories for product forms — the shared list minus the "All" filter.
const PRODUCT_CATEGORIES = categories.filter((c) => c !== "All");

const formatINR = (rupees: number) => `₹${rupees.toLocaleString("en-IN")}`;

type AdminStats = {
  productCount: number;
  orderCount: number;
  userCount: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
      name: string | null;
      email: string | null;
    };
  }>;
};

const MAX_IMAGES = 3;

export default function AdminClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingImage, setDeletingImage] = useState<{ productId: number; url: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    model: "",
    price: 0,
    oldPrice: 0,
    category: "Neckbands",
    color: "",
    description: "",
    badge: "",
  });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {

    let cancelled = false;

    async function load() {
      try {
        const [productsRes, statsRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/stats"),
        ]);

        const productsBody = await productsRes.json().catch(() => ({}));
        const statsBody = await statsRes.json().catch(() => ({}));

        if (cancelled) return;

        if (!productsRes.ok) {
          showMessage(
            "error",
            productsBody?.error
              ? `Failed to load products: ${productsBody.error}`
              : `Failed to load products (HTTP ${productsRes.status})`
          );
          setProducts([]);
        } else {
          setProducts((productsBody as Product[]) ?? []);
        }

        if (!statsRes.ok) {
          showMessage("error", "Failed to load statistics");
        } else {
          setStats(statsBody as AdminStats);
        }
      } catch {
        if (!cancelled) {
          showMessage("error", "Failed to load admin data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);


  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setSaving(id);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...updates,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showMessage(
          "error",
          data.details || data.error || JSON.stringify(data) || "Unknown server error"
        );
        return;
      }

      setProducts((products) =>
        products.map((product) =>
          product.id === id ? { ...product, ...updates } : product
        )
      );
      showMessage("success", "Product updated successfully");
    } catch {
      showMessage("error", "Error updating product");
    } finally {
      setSaving(null);
    }
  };

  const uploadImage = async (productId: number, file: File) => {
    const current = products.find((p) => p.id === productId);
    if (current && current.imageUrls.length >= MAX_IMAGES) {
      showMessage("error", `You can upload up to ${MAX_IMAGES} images per product.`);
      return;
    }

    setUploading(productId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        showMessage("error", data?.error || "Failed to upload image");
        return;
      }

      // The upload endpoint only stores the file and returns its URL. Persist
      // that URL onto the product record so it survives a refresh.
      const nextImages = [...(current?.imageUrls ?? []), data.url as string].slice(
        0,
        MAX_IMAGES,
      );

      const saveRes = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, imageUrls: nextImages }),
      });

      const saveData = await saveRes.json().catch(() => ({}));

      if (!saveRes.ok) {
        showMessage("error", saveData?.details || saveData?.error || "Failed to save image");
        return;
      }

      const persisted =
        (saveData?.product?.imageUrls as string[] | undefined) ?? nextImages;

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, imageUrls: persisted } : p)),
      );

      showMessage("success", "Image uploaded successfully");
    } catch {
      showMessage("error", "Error uploading image");
    } finally {
      setUploading(null);
    }
  };


  const deleteImage = async (productId: number, imageUrl: string) => {
    setDeletingImage({ productId, url: imageUrl });
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          imageUrls:
            products.find((p) => p.id === productId)?.imageUrls.filter((url) => url !== imageUrl) || [],
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showMessage("error", data?.details || data?.error || "Failed to delete image");
        return;
      }

      // Keep UI in sync with server response (in case server normalizes)
      const updatedImages = (data?.product?.imageUrls as string[] | undefined) ||
        products.find((p) => p.id === productId)?.imageUrls.filter((url) => url !== imageUrl) ||
        [];

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, imageUrls: updatedImages } : p)),
      );
      showMessage("success", "Image deleted successfully");
    } catch {
      showMessage("error", "Error deleting image");
    } finally {
      setDeletingImage(null);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showMessage("error", data?.details || data?.error || "Failed to delete product");
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showMessage("success", "Product deleted successfully");
    } catch {
      showMessage("error", "Error deleting product");
    }
  };

  const query = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    if (!query) return true;
    return (
      product.title.toLowerCase().includes(query) ||
      product.model.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.color.toLowerCase().includes(query)
    );
  });


  if (loading) {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-ink-950">Dashboard</h1>
          <p className="mt-1 text-ink-500 text-sm">
            Manage your products, view statistics, and monitor orders
          </p>
        </div>

        {/* Dashboard Statistics */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="text-sm font-medium text-ink-500">Products</p>
              <p className="mt-2 text-3xl font-black text-ink-950">{stats.productCount}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="text-sm font-medium text-ink-500">Orders</p>
              <p className="mt-2 text-3xl font-black text-ink-950">{stats.orderCount}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="text-sm font-medium text-ink-500">Users</p>
              <p className="mt-2 text-3xl font-black text-ink-950">{stats.userCount}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="text-sm font-medium text-ink-500">Revenue</p>
              <p className="mt-2 text-3xl font-black text-ink-950">{formatINR(stats.totalRevenue)}</p>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {stats && stats.recentOrders.length > 0 && (
          <div className="mb-8 rounded-2xl border border-line bg-white p-6">
            <h2 className="text-xl font-bold text-ink-950">Recent Orders</h2>
            <div className="mt-4 space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-canvas p-4"
                >
                  <div>
                    <p className="font-medium text-ink-950">{order.orderNumber}</p>
                    <p className="text-sm text-ink-500">
                      {order.user.name || order.user.email || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink-950">{formatINR(order.total)}</p>
                    <p className="text-sm text-ink-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink-950">Products</h2>
            <p className="mt-1 text-sm text-ink-500">
              Manage your product catalog
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add Product
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="mb-6 rounded-2xl border border-line bg-white p-6">
            <h3 className="text-lg font-bold text-ink-950 mb-4">Add New Product</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                  Product Title
                </label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  placeholder="Enter product title"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                  Model
                </label>
                <input
                  type="text"
                  value={newProduct.model}
                  onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  placeholder="Enter model number"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                  Price (Rs.)
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                  Old Price (Rs.)
                </label>
                <input
                  type="number"
                  value={newProduct.oldPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, oldPrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                  Color
                </label>
                <input
                  type="text"
                  value={newProduct.color}
                  onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  placeholder="Enter color"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">
                Description
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                placeholder="Enter product description"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={async () => {
                  setAdding(true);
                  try {
                    const res = await fetch("/api/admin/products", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newProduct),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      showMessage("error", data?.details || data?.error || "Failed to add product");
                    } else {
                      setProducts((prev) => [...prev, data.product]);
                      setShowAddForm(false);
                      setNewProduct({
                        title: "",
                        model: "",
                        price: 0,
                        oldPrice: 0,
                        category: "Neckbands",
                        color: "",
                        description: "",
                        badge: "",
                      });
                      showMessage("success", "Product added successfully");
                    }
                  } catch {
                    showMessage("error", "Error adding product");
                  } finally {
                    setAdding(false);
                  }
                }}
                disabled={adding || !newProduct.title || !newProduct.model || !newProduct.price}
                className="btn btn-primary flex items-center gap-2"
              >
                {adding ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save size={16} />
                )}
                Add Product
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewProduct({
                    title: "",
                    model: "",
                    price: 0,
                    oldPrice: 0,
                    category: "Neckbands",
                    color: "",
                    description: "",
                    badge: "",
                  });
                }}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="text"
              placeholder="Search by name, model, category..."
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
              onDelete={deleteProduct}
              saving={saving === product.id}
              uploading={uploading === product.id}
              deletingImage={deletingImage}
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
  onDelete,
  saving,
  uploading,
  deletingImage,
}: {
  product: Product;
  onUpdate: (id: number, updates: Partial<Product>) => void;
  onUpload: (id: number, file: File) => void;
  onDeleteImage: (productId: number, imageUrl: string) => void;
  onDelete: (id: number) => void;
  saving: boolean;
  uploading: boolean;
  deletingImage: { productId: number; url: string } | null;
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
    if (!file) return;

    // Client-side validation to avoid server errors
    const isAllowed = ["image/png", "image/jpeg", "image/webp"].includes(file.type);
    if (!isAllowed) {
      alert("Please upload a valid image (png, jpg, jpeg, webp)");
      e.target.value = "";
      return;
    }

    onUpload(product.id, file);
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
                      unoptimized
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
                    unoptimized
                  />
                  <button
                    onClick={() => onDeleteImage(product.id, url)}
                    disabled={!!deletingImage && deletingImage.productId === product.id && deletingImage.url === url}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 disabled:hover:bg-red-500"
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
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
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
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="btn bg-red-500 text-white hover:bg-red-600 border-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
