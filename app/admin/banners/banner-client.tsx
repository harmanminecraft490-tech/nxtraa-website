"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Save, X, Image as ImageIcon, Trash2, Plus, ArrowLeft, Pencil, Upload, ExternalLink, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";

type Banner = {
  id: number;
  src: string;
  href: string;
  alt: string;
  order: number;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  displayMode: "FIT" | "FILL";
};

export default function BannerClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [newBanner, setNewBanner] = useState({
    src: "",
    href: "/shop",
    alt: "Nxteraa Banner",
    order: 0,
    desktopImageUrl: "",
    mobileImageUrl: "",
    displayMode: "FIT" as "FIT" | "FILL",
  });

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
      } catch {
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
    target: "new-desktop" | "new-mobile" | "edit-desktop" | "edit-mobile"
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

      if (target === "new-desktop") {
        setNewBanner((prev) => ({ ...prev, desktopImageUrl: data.url, src: data.url }));
      } else if (target === "new-mobile") {
        setNewBanner((prev) => ({ ...prev, mobileImageUrl: data.url }));
      } else if (target === "edit-desktop" && editingBanner) {
        setEditingBanner((prev) => prev ? { ...prev, desktopImageUrl: data.url, src: data.url } : null);
      } else if (target === "edit-mobile" && editingBanner) {
        setEditingBanner((prev) => prev ? { ...prev, mobileImageUrl: data.url } : null);
      }
      showMessage("success", "Image uploaded successfully");
    } catch {
      showMessage("error", "Error uploading image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.src && !newBanner.desktopImageUrl) {
      showMessage("error", "Please upload a desktop banner image");
      return;
    }

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBanner,
          src: newBanner.desktopImageUrl || newBanner.src,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add banner");

      setBanners((prev) => [...prev, data.banner].sort((a, b) => a.order - b.order));
      setShowAddForm(false);
      setNewBanner({ src: "", href: "/shop", alt: "Nxteraa Banner", order: banners.length + 1, desktopImageUrl: "", mobileImageUrl: "", displayMode: "FIT" });
      showMessage("success", "Banner added successfully");
    } catch {
      showMessage("error", "Error adding banner");
    }
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner || (!editingBanner.src && !editingBanner.desktopImageUrl)) {
      showMessage("error", "Please upload a desktop banner image");
      return;
    }

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingBanner,
          src: editingBanner.desktopImageUrl || editingBanner.src,
        }),
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
    } catch {
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
    } catch {
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
            <p className="mt-1 text-ink-500 text-sm">Upload separate desktop and mobile banners for a premium responsive experience.</p>
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

            {/* Image Uploads */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Desktop Image */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400">
                  <Monitor size={14} /> Desktop Banner (Wide)
                </label>
                {newBanner.desktopImageUrl ? (
                  <div className="relative aspect-[2.6/1] w-full overflow-hidden rounded-xl bg-mist mb-2 border border-line">
                    <Image src={newBanner.desktopImageUrl} alt="Desktop preview" fill className="object-cover" />
                    <button
                      onClick={() => setNewBanner((prev) => ({ ...prev, desktopImageUrl: "", src: "" }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex aspect-[2.6/1] w-full flex-col items-center justify-center rounded-xl bg-mist mb-2 border-2 border-dashed border-line p-4 text-center">
                    <Monitor className="text-ink-300 mb-2" size={28} />
                    <p className="text-xs text-ink-500">Upload wide banner for desktop</p>
                  </div>
                )}
                <label className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload Desktop Image"}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "new-desktop")} disabled={uploading} className="hidden" />
                </label>
                <p className="mt-1.5 text-[11px] text-ink-400">Recommended: 1920×720 or 2000×750</p>
              </div>

              {/* Mobile Image */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400">
                  <Smartphone size={14} /> Mobile Banner (Portrait)
                  <span className="text-[10px] font-normal normal-case text-ink-300">Optional</span>
                </label>
                {newBanner.mobileImageUrl ? (
                  <div className="relative aspect-[2.6/1] w-full overflow-hidden rounded-xl bg-mist mb-2 border border-line">
                    <Image src={newBanner.mobileImageUrl} alt="Mobile preview" fill className="object-cover" />
                    <button
                      onClick={() => setNewBanner((prev) => ({ ...prev, mobileImageUrl: "" }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex aspect-[2.6/1] w-full flex-col items-center justify-center rounded-xl bg-mist mb-2 border-2 border-dashed border-line p-4 text-center">
                    <Smartphone className="text-ink-300 mb-2" size={28} />
                    <p className="text-xs text-ink-500">Upload portrait banner for mobile</p>
                  </div>
                )}
                <label className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload Mobile Image"}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "new-mobile")} disabled={uploading} className="hidden" />
                </label>
                <p className="mt-1.5 text-[11px] text-ink-400">Recommended: 1080×1350 or 1080×1440</p>
              </div>
            </div>

            {/* Link / Alt / Order */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Destination Link</label>
                <input type="text" value={newBanner.href} onChange={(e) => setNewBanner({ ...newBanner, href: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" placeholder="/shop" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Alt Text</label>
                <input type="text" value={newBanner.alt} onChange={(e) => setNewBanner({ ...newBanner, alt: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" placeholder="Nxteraa Audio" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Display Order</label>
                <input type="number" value={newBanner.order} onChange={(e) => setNewBanner({ ...newBanner, order: Number(e.target.value) })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" />
              </div>
            </div>

            {/* Display Mode */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Display Mode</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setNewBanner({ ...newBanner, displayMode: "FIT" })}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    newBanner.displayMode === "FIT"
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-line bg-white hover:border-ink-300"
                  }`}
                >
                  <span className="block text-sm font-bold text-ink-950">Fit (Recommended)</span>
                  <span className="block text-[11px] text-ink-500 mt-0.5">Full image visible, no cropping. Background fill if needed.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewBanner({ ...newBanner, displayMode: "FILL" })}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    newBanner.displayMode === "FILL"
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-line bg-white hover:border-ink-300"
                  }`}
                >
                  <span className="block text-sm font-bold text-ink-950">Fill</span>
                  <span className="block text-[11px] text-ink-500 mt-0.5">Fills the container. May crop edges slightly.</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-line">
              <button onClick={handleAddBanner} disabled={(!newBanner.desktopImageUrl && !newBanner.src) || uploading} className="btn btn-primary flex items-center gap-2">
                <Save size={16} /> Save Banner
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn btn-secondary flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Banner Form */}
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

            {/* Image Uploads */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Desktop Image */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400">
                  <Monitor size={14} /> Desktop Banner (Wide)
                </label>
                {editingBanner.desktopImageUrl || editingBanner.src ? (
                  <div className="relative aspect-[2.6/1] w-full overflow-hidden rounded-xl bg-mist mb-2 border border-line">
                    <Image src={editingBanner.desktopImageUrl || editingBanner.src} alt="Desktop preview" fill className="object-cover" />
                    <button
                      onClick={() => setEditingBanner((prev) => prev ? { ...prev, desktopImageUrl: "", src: "" } : null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex aspect-[2.6/1] w-full flex-col items-center justify-center rounded-xl bg-mist mb-2 border-2 border-dashed border-line p-4 text-center">
                    <Monitor className="text-ink-300 mb-2" size={28} />
                    <p className="text-xs text-ink-500">Upload wide banner for desktop</p>
                  </div>
                )}
                <label className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload Desktop Image"}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "edit-desktop")} disabled={uploading} className="hidden" />
                </label>
                <p className="mt-1.5 text-[11px] text-ink-400">Recommended: 1920×720 or 2000×750</p>
              </div>

              {/* Mobile Image */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400">
                  <Smartphone size={14} /> Mobile Banner (Portrait)
                  <span className="text-[10px] font-normal normal-case text-ink-300">Optional</span>
                </label>
                {editingBanner.mobileImageUrl ? (
                  <div className="relative aspect-[2.6/1] w-full overflow-hidden rounded-xl bg-mist mb-2 border border-line">
                    <Image src={editingBanner.mobileImageUrl} alt="Mobile preview" fill className="object-cover" />
                    <button
                      onClick={() => setEditingBanner((prev) => prev ? { ...prev, mobileImageUrl: "" } : null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex aspect-[2.6/1] w-full flex-col items-center justify-center rounded-xl bg-mist mb-2 border-2 border-dashed border-line p-4 text-center">
                    <Smartphone className="text-ink-300 mb-2" size={28} />
                    <p className="text-xs text-ink-500">Upload portrait banner for mobile</p>
                  </div>
                )}
                <label className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload Mobile Image"}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "edit-mobile")} disabled={uploading} className="hidden" />
                </label>
                <p className="mt-1.5 text-[11px] text-ink-400">Recommended: 1080×1350 or 1080×1440</p>
              </div>
            </div>

            {/* Link / Alt / Order */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Destination Link</label>
                <input type="text" value={editingBanner.href} onChange={(e) => setEditingBanner({ ...editingBanner, href: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Alt Text</label>
                <input type="text" value={editingBanner.alt} onChange={(e) => setEditingBanner({ ...editingBanner, alt: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Display Order</label>
                <input type="number" value={editingBanner.order} onChange={(e) => setEditingBanner({ ...editingBanner, order: Number(e.target.value) })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-accent" />
              </div>
            </div>

            {/* Display Mode */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Display Mode</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBanner((prev) => prev ? { ...prev, displayMode: "FIT" } : null)}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    editingBanner.displayMode === "FIT"
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-line bg-white hover:border-ink-300"
                  }`}
                >
                  <span className="block text-sm font-bold text-ink-950">Fit (Recommended)</span>
                  <span className="block text-[11px] text-ink-500 mt-0.5">Full image visible, no cropping. Background fill if needed.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBanner((prev) => prev ? { ...prev, displayMode: "FILL" } : null)}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    editingBanner.displayMode === "FILL"
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-line bg-white hover:border-ink-300"
                  }`}
                >
                  <span className="block text-sm font-bold text-ink-950">Fill</span>
                  <span className="block text-[11px] text-ink-500 mt-0.5">Fills the container. May crop edges slightly.</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-line">
              <button onClick={handleUpdateBanner} disabled={(!editingBanner.desktopImageUrl && !editingBanner.src) || uploading} className="btn btn-primary flex items-center gap-2">
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
              <p className="mt-1 text-sm text-ink-500">Add a custom banner above to get started.</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="flex flex-col md:flex-row gap-6 rounded-2xl border border-line bg-white p-5 items-center shadow-xs hover:border-ink-300 transition-colors">
                {/* Desktop Preview */}
                <div className="relative aspect-[2.6/1] w-full md:w-80 overflow-hidden rounded-xl bg-mist shrink-0 border border-line">
                  <Image src={banner.desktopImageUrl || banner.src} alt={banner.alt || "Banner image"} fill className="object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    <Monitor size={10} /> DESKTOP
                  </div>
                </div>
                {/* Mobile Preview */}
                {banner.mobileImageUrl && (
                  <div className="relative aspect-[2.6/1] w-full md:w-40 overflow-hidden rounded-xl bg-mist shrink-0 border border-line">
                    <Image src={banner.mobileImageUrl} alt={banner.alt || "Mobile banner"} fill className="object-cover" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <Smartphone size={10} /> MOBILE
                    </div>
                  </div>
                )}
                <div className="flex-1 space-y-1.5 w-full text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-mist px-2 py-0.5 text-xs font-bold text-ink-700">
                      Order #{banner.order}
                    </span>
                    <a href={banner.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline text-xs font-semibold">
                      {banner.href} <ExternalLink size={12} />
                    </a>
                    {!banner.mobileImageUrl && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">No mobile image</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      banner.displayMode === "FIT"
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-blue-700 bg-blue-50"
                    }`}>
                      {banner.displayMode === "FIT" ? "FIT" : "FILL"}
                    </span>
                  </div>
                  <p className="font-semibold text-ink-950">{banner.alt || "Untitled Banner"}</p>
                  <p className="text-xs text-ink-400 truncate max-w-md">{banner.desktopImageUrl || banner.src}</p>
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
