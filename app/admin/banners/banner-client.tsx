"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Save, X, Image as ImageIcon, Trash2, Plus, ArrowLeft, Pencil, Upload, ExternalLink } from "lucide-react";
import Link from "next/link";

type Banner = {
  id: number;
  src: string;
  href: string;
  alt: string;
  order: number;
};

export default function BannerClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [newBanner, setNewBanner] = useState({ src: "", href: "/shop", alt: "Nxteraa Banner", order: 0 });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadBanners() {
      try {
        const res = await fetch("/api/admin/banners");
        if (!res.ok) throw new Error("Failed to load banners");
        const data = await res.json();
        if (!cancelled) setBanners(data);
      } catch (e) {
        if (!cancelled) showMessage("error", "Error loading banners");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadBanners();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "new" | "edit"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAllowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"].includes(file.type);
    if (!isAllowed) {
      alert("Please upload a valid image (JPG, PNG, WEBP, GIF, AVIF)");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");

      if (target === "new") {
        setNewBanner((prev) => ({ ...prev, src: data.url }));
      } else if (editingBanner) {
        setEditingBanner((prev) => prev ? { ...prev, src: data.url } : null);
      }
      showMessage("success", "Banner image uploaded successfully");
    } catch (error) {
      showMessage("error", "Error uploading image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.src) {
      showMessage("error", "Please upload or provide a banner image URL");
      return;
    }

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add banner");

      setBanners((prev) => [...prev, data.banner].sort((a, b) => a.order - b.order));
      setShowAddForm(false);
      setNewBanner({ src: "", href: "/shop", alt: "Nxteraa Banner", order: banners.length + 1 });
      showMessage("success", "Banner added successfully");
    } catch (e) {
      showMessage("error", "Error adding banner");
    }
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner || !editingBanner.src) {
      showMessage("error", "Please upload or provide a banner image URL");
      return;
    }

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBanner),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update banner");

      setBanners((prev) =>
        prev
          .map((b) => (b.id === editingBanner.id ? data.banner : b))
          .sort((a, b) => a.order - b.order)
      );
      setEditingBanner(null);
      showMessage("success", "Banner updated successfully");
    } catch (e) {
      showMessage("error", "Error updating banner");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete banner");

      setBanners((prev) => prev.filter((b) => b.id !== id));
      showMessage("success", "Banner deleted successfully");
    } catch (e) {
      showMessage("error", "Error deleting banner");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-ink-500 hover:text-ink-950 mb-2 text-sm font-medium transition-colors">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-ink-950 tracking-tight">Manage Banners</h1>
            <p className="mt-1 text-ink-500 text-sm">All banners (including defaults) shown below. Upload, replace, reorder, or delete any banner.</p>
          </div>
          <button onClick={() => { setShowAddForm(true); setEditingBanner(null); }} className="btn btn-primary flex items-center gap-2 self-start sm:self-auto">
            <Plus size={16} /> Add Banner
          </button>
        </div>

        {message && (
          <div className={`mb-6 rounded-2xl p-4 font-medium text-sm flex items-center justify-between transition-all ${
            message.type === "success" ? "bg-signal-500/10 text-signal-500 border border-signal-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Add Banner Form */}
        {showAddForm && (
          <div className="mb-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-950">Add New Banner</h3>
              <button onClick={() => setShowAddForm(false)} className="text-ink-400 hover:text-ink-950">
                <X size={18} />
              </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Banner Image</label>
                {newBanner.src ? (
                  <div className="relative aspect-[2.6/1] w-full overflow-hidden rounded-xl bg-mist mb-3 border border-line">
                    <Image src={newBanner.src} alt="Preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[2.6/1] w-full flex-col items-center justify-center rounded-xl bg-mist mb-3 border-2 border-dashed border-line p-4 text-center">
                    <ImageIcon className="text-ink-300 mb-2" size={32} />
                    <p className="text-xs text-ink-500">Upload an image or paste URL below</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={14} />
                    {uploading ? "Uploading..." : "Upload Image File"}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "new")} disabled={uploading} className="hidden" />
                  </label>
                  <div>
                    <input
                      type="text"
                      value={newBanner.src}
                      onChange={(e) => setNewBanner({ ...newBanner, src: e.target.value })}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs focus:border-accent"
                      placeholder="Or enter image URL directly"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Destination Link (Href)</label>
                  <input type="text" value={newBanner.href} onChange={(e) => setNewBanner({ ...newBanner, href: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" placeholder="/shop" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Alt / Accessibility Text</label>
                  <input type="text" value={newBanner.alt} onChange={(e) => setNewBanner({ ...newBanner, alt: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" placeholder="Nxteraa Audio Bestseller" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Display Order</label>
                  <input type="number" value={newBanner.order} onChange={(e) => setNewBanner({ ...newBanner, order: Number(e.target.value) })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 pt-4 border-t border-line">
              <button onClick={handleAddBanner} disabled={!newBanner.src || uploading} className="btn btn-primary flex items-center gap-2">
                <Save size={16} /> Save Banner
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn btn-secondary flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Banner Modal/Form */}
        {editingBanner && (
          <div className="mb-8 rounded-2xl border border-accent bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-950 flex items-center gap-2">
                <Pencil size={18} className="text-accent" /> Edit Banner #{editingBanner.id}
              </h3>
              <button onClick={() => setEditingBanner(null)} className="text-ink-400 hover:text-ink-950">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Current / Replacement Image</label>
                {editingBanner.src ? (
                  <div className="relative aspect-[2.6/1] w-full overflow-hidden rounded-xl bg-mist mb-3 border border-line">
                    <Image src={editingBanner.src} alt={editingBanner.alt || "Preview"} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[2.6/1] w-full items-center justify-center rounded-xl bg-mist mb-3 border border-line">
                    <ImageIcon className="text-ink-300" size={32} />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={14} />
                    {uploading ? "Uploading..." : "Upload Replacement Image"}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "edit")} disabled={uploading} className="hidden" />
                  </label>
                  <div>
                    <input
                      type="text"
                      value={editingBanner.src}
                      onChange={(e) => setEditingBanner({ ...editingBanner, src: e.target.value })}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs focus:border-accent"
                      placeholder="Image URL"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Destination Link (Href)</label>
                  <input type="text" value={editingBanner.href} onChange={(e) => setEditingBanner({ ...editingBanner, href: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Alt / Accessibility Text</label>
                  <input type="text" value={editingBanner.alt} onChange={(e) => setEditingBanner({ ...editingBanner, alt: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Display Order</label>
                  <input type="number" value={editingBanner.order} onChange={(e) => setEditingBanner({ ...editingBanner, order: Number(e.target.value) })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 pt-4 border-t border-line">
              <button onClick={handleUpdateBanner} disabled={!editingBanner.src || uploading} className="btn btn-primary flex items-center gap-2">
                <Save size={16} /> Save Changes
              </button>
              <button onClick={() => setEditingBanner(null)} className="btn btn-secondary flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Banner List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-400">All Homepage Banners ({banners.length})</h2>
            <span className="text-xs text-ink-500 font-medium">Edit, reorder, or delete any banner</span>
          </div>

          {banners.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-ink-300 mb-3" />
              <p className="text-ink-950 font-bold">No banners yet</p>
              <p className="mt-1 text-sm text-ink-500">Default banners will be auto-added when you refresh. Add a custom banner above to get started.</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="flex flex-col md:flex-row gap-6 rounded-2xl border border-line bg-white p-5 items-center shadow-xs hover:border-ink-300 transition-colors">
                <div className="relative aspect-[2.6/1] w-full md:w-80 overflow-hidden rounded-xl bg-mist shrink-0 border border-line">
                  <Image src={banner.src} alt={banner.alt || "Banner image"} fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-1.5 w-full text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-mist px-2 py-0.5 text-xs font-bold text-ink-700">
                      Order #{banner.order}
                    </span>
                    <a href={banner.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline text-xs font-semibold">
                      {banner.href} <ExternalLink size={12} />
                    </a>
                  </div>
                  <p className="font-semibold text-ink-950">{banner.alt || "Untitled Banner"}</p>
                  <p className="text-xs text-ink-400 truncate max-w-md">{banner.src}</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-line">
                  <button onClick={() => { setEditingBanner(banner); setShowAddForm(false); }} className="btn btn-secondary btn-sm flex items-center gap-1.5">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Delete Banner">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
