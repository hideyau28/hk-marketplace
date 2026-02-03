"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type Section = {
  id: string;
  title: string;
  type: string;
  cardSize: string;
  sortOrder: number;
  active: boolean;
  productIds: string[];
  filterType: string | null;
  filterValue: string | null;
};

type Banner = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
  sortOrder: number;
  active: boolean;
  position: string;
};

type Product = {
  id: string;
  title: string;
  imageUrl: string | null;
  category: string | null;
};

type Props = {
  initialSections: Section[];
  initialBanners: Banner[];
  products: Product[];
  locale: string;
};

export default function HomepageCMS({
  initialSections,
  initialBanners,
  products,
  locale,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sections" | "banners">("sections");
  const [sections, setSections] = useState(initialSections);
  const [banners, setBanners] = useState(initialBanners);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isCreatingBanner, setIsCreatingBanner] = useState(false);
  const [saving, setSaving] = useState(false);

  // SECTION CRUD
  const saveSection = async (section: Partial<Section>, isNew: boolean) => {
    setSaving(true);
    try {
      const url = isNew
        ? "/api/homepage/sections"
        : `/api/homepage/sections/${section.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      });
      if (!res.ok) throw new Error("Failed to save section");
      router.refresh();
      setEditingSection(null);
      setIsCreatingSection(false);
      // Refetch sections
      const sectionsRes = await fetch("/api/homepage/sections");
      const sectionsData = await sectionsRes.json();
      if (sectionsData.ok) setSections(sectionsData.data.sections);
    } catch (err) {
      alert("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("確定要刪除呢個 Section？")) return;
    try {
      const res = await fetch(`/api/homepage/sections/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("刪除失敗");
    }
  };

  const moveSectionUp = async (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    // Update sortOrder
    newSections.forEach((s, i) => (s.sortOrder = i + 1));
    setSections(newSections);
    await fetch("/api/homepage/sections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sections: newSections.map((s) => ({ id: s.id, sortOrder: s.sortOrder })),
      }),
    });
  };

  const moveSectionDown = async (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    newSections.forEach((s, i) => (s.sortOrder = i + 1));
    setSections(newSections);
    await fetch("/api/homepage/sections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sections: newSections.map((s) => ({ id: s.id, sortOrder: s.sortOrder })),
      }),
    });
  };

  const toggleSectionActive = async (section: Section) => {
    const newActive = !section.active;
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, active: newActive } : s))
    );
    await fetch(`/api/homepage/sections/${section.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newActive }),
    });
  };

  // BANNER CRUD
  const saveBanner = async (banner: Partial<Banner>, isNew: boolean) => {
    setSaving(true);
    try {
      const url = isNew
        ? "/api/homepage/banners"
        : `/api/homepage/banners/${banner.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      });
      if (!res.ok) throw new Error("Failed to save banner");
      router.refresh();
      setEditingBanner(null);
      setIsCreatingBanner(false);
      // Refetch banners
      const bannersRes = await fetch("/api/homepage/banners");
      const bannersData = await bannersRes.json();
      if (bannersData.ok) setBanners(bannersData.data.banners);
    } catch (err) {
      alert("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("確定要刪除呢個 Banner？")) return;
    try {
      const res = await fetch(`/api/homepage/banners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("刪除失敗");
    }
  };

  const toggleBannerActive = async (banner: Banner) => {
    const newActive = !banner.active;
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, active: newActive } : b))
    );
    await fetch(`/api/homepage/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newActive }),
    });
  };

  const heroBanners = banners.filter((b) => b.position === "hero");
  const midBanners = banners.filter((b) => b.position === "mid");

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("sections")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === "sections"
              ? "bg-olive-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          Sections 管理
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === "banners"
              ? "bg-olive-600 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          Banner 管理
        </button>
      </div>

      {/* SECTIONS TAB */}
      {activeTab === "sections" && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
            <h2 className="font-semibold text-zinc-900">Homepage Sections</h2>
            <button
              onClick={() => {
                setIsCreatingSection(true);
                setEditingSection({
                  id: "",
                  title: "",
                  type: "product_grid",
                  cardSize: "small",
                  sortOrder: sections.length + 1,
                  active: true,
                  productIds: [],
                  filterType: "category",
                  filterValue: "",
                });
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-olive-600 text-white rounded-lg text-sm hover:bg-olive-700"
            >
              <Plus size={16} /> 新增 Section
            </button>
          </div>

          <div className="divide-y divide-zinc-200">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center gap-4 p-4 hover:bg-zinc-50"
              >
                <GripVertical size={20} className="text-zinc-400" />
                <div className="flex-1">
                  <div className="font-medium text-zinc-900">{section.title}</div>
                  <div className="text-sm text-zinc-500">
                    {section.cardSize === "large" ? "大卡" : "細卡"} ·{" "}
                    {section.filterType
                      ? `${section.filterType}: ${section.filterValue}`
                      : `${section.productIds.length} 產品`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveSectionUp(index)}
                    disabled={index === 0}
                    className="p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    onClick={() => moveSectionDown(index)}
                    disabled={index === sections.length - 1}
                    className="p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
                <button
                  onClick={() => toggleSectionActive(section)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    section.active
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {section.active ? "啟用" : "停用"}
                </button>
                <button
                  onClick={() => {
                    setEditingSection(section);
                    setIsCreatingSection(false);
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-600"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-2 text-zinc-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BANNERS TAB */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          {/* Hero Banners */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="font-semibold text-zinc-900">Hero Banners (頂部輪播)</h2>
              <button
                onClick={() => {
                  setIsCreatingBanner(true);
                  setEditingBanner({
                    id: "",
                    imageUrl: "",
                    title: "",
                    subtitle: "",
                    linkUrl: "",
                    sortOrder: heroBanners.length + 1,
                    active: true,
                    position: "hero",
                  });
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-olive-600 text-white rounded-lg text-sm hover:bg-olive-700"
              >
                <Plus size={16} /> 新增 Hero Banner
              </button>
            </div>

            <div className="divide-y divide-zinc-200">
              {heroBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 p-4 hover:bg-zinc-50"
                >
                  <div className="w-24 h-14 rounded-lg overflow-hidden bg-zinc-100">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900">
                      {banner.title || "(無標題)"}
                    </div>
                    <div className="text-sm text-zinc-500">{banner.subtitle}</div>
                  </div>
                  <button
                    onClick={() => toggleBannerActive(banner)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      banner.active
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {banner.active ? "啟用" : "停用"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingBanner(banner);
                      setIsCreatingBanner(false);
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="p-2 text-zinc-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {heroBanners.length === 0 && (
                <div className="p-8 text-center text-zinc-500">
                  未有 Hero Banner
                </div>
              )}
            </div>
          </div>

          {/* Mid Banners */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="font-semibold text-zinc-900">Mid-Page Banners (中間位置)</h2>
              <button
                onClick={() => {
                  setIsCreatingBanner(true);
                  setEditingBanner({
                    id: "",
                    imageUrl: "",
                    title: "",
                    subtitle: "",
                    linkUrl: "",
                    sortOrder: midBanners.length + 1,
                    active: true,
                    position: "mid",
                  });
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-olive-600 text-white rounded-lg text-sm hover:bg-olive-700"
              >
                <Plus size={16} /> 新增 Mid Banner
              </button>
            </div>

            <div className="divide-y divide-zinc-200">
              {midBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 p-4 hover:bg-zinc-50"
                >
                  <div className="w-24 h-14 rounded-lg overflow-hidden bg-zinc-100">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900">
                      {banner.title || "(無標題)"}
                    </div>
                    <div className="text-sm text-zinc-500">{banner.subtitle}</div>
                  </div>
                  <button
                    onClick={() => toggleBannerActive(banner)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      banner.active
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {banner.active ? "啟用" : "停用"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingBanner(banner);
                      setIsCreatingBanner(false);
                    }}
                    className="p-2 text-zinc-400 hover:text-zinc-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="p-2 text-zinc-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {midBanners.length === 0 && (
                <div className="p-8 text-center text-zinc-500">
                  未有 Mid-Page Banner
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION EDIT MODAL */}
      {(editingSection || isCreatingSection) && editingSection && (
        <SectionModal
          section={editingSection}
          products={products}
          isNew={isCreatingSection}
          saving={saving}
          onSave={(s) => saveSection(s, isCreatingSection)}
          onClose={() => {
            setEditingSection(null);
            setIsCreatingSection(false);
          }}
        />
      )}

      {/* BANNER EDIT MODAL */}
      {(editingBanner || isCreatingBanner) && editingBanner && (
        <BannerModal
          banner={editingBanner}
          isNew={isCreatingBanner}
          saving={saving}
          onSave={(b) => saveBanner(b, isCreatingBanner)}
          onClose={() => {
            setEditingBanner(null);
            setIsCreatingBanner(false);
          }}
        />
      )}
    </div>
  );
}

// Section Edit Modal
function SectionModal({
  section,
  products,
  isNew,
  saving,
  onSave,
  onClose,
}: {
  section: Section;
  products: Product[];
  isNew: boolean;
  saving: boolean;
  onSave: (s: Partial<Section>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [cardSize, setCardSize] = useState(section.cardSize);
  const [selectionMode, setSelectionMode] = useState<"auto" | "manual">(
    section.filterType ? "auto" : "manual"
  );
  const [filterType, setFilterType] = useState(section.filterType || "category");
  const [filterValue, setFilterValue] = useState(section.filterValue || "");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    section.productIds || []
  );
  const [active, setActive] = useState(section.active);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    onSave({
      id: section.id || undefined,
      title,
      type: "product_grid",
      cardSize,
      active,
      filterType: selectionMode === "auto" ? filterType : null,
      filterValue: selectionMode === "auto" ? filterValue : null,
      productIds: selectionMode === "manual" ? selectedProductIds : [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="font-semibold text-lg">
            {isNew ? "新增 Section" : "編輯 Section"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              placeholder="例如：Air Jordan 系列"
            />
          </div>

          {/* Card Size */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              卡片大小
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCardSize("small")}
                className={`flex-1 px-4 py-2 rounded-xl border ${
                  cardSize === "small"
                    ? "border-olive-600 bg-olive-50 text-olive-700"
                    : "border-zinc-200 text-zinc-700"
                }`}
              >
                細卡 (160px)
              </button>
              <button
                type="button"
                onClick={() => setCardSize("large")}
                className={`flex-1 px-4 py-2 rounded-xl border ${
                  cardSize === "large"
                    ? "border-olive-600 bg-olive-50 text-olive-700"
                    : "border-zinc-200 text-zinc-700"
                }`}
              >
                大卡 (280px)
              </button>
            </div>
          </div>

          {/* Selection Mode */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              產品選擇方式
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectionMode("auto")}
                className={`flex-1 px-4 py-2 rounded-xl border ${
                  selectionMode === "auto"
                    ? "border-olive-600 bg-olive-50 text-olive-700"
                    : "border-zinc-200 text-zinc-700"
                }`}
              >
                自動篩選
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode("manual")}
                className={`flex-1 px-4 py-2 rounded-xl border ${
                  selectionMode === "manual"
                    ? "border-olive-600 bg-olive-50 text-olive-700"
                    : "border-zinc-200 text-zinc-700"
                }`}
              >
                手動選擇
              </button>
            </div>
          </div>

          {/* Auto Filter Options */}
          {selectionMode === "auto" && (
            <div className="space-y-3 bg-zinc-50 p-4 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  篩選類型
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
                >
                  <option value="category">類別 (Category)</option>
                  <option value="shoeType">對象 (ShoeType)</option>
                  <option value="featured">精選 (Featured)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  篩選值
                </label>
                {filterType === "category" && (
                  <select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
                  >
                    <option value="">-- 選擇類別 --</option>
                    <option value="Air Jordan">Air Jordan</option>
                    <option value="Dunk / SB">Dunk / SB</option>
                    <option value="Air Max">Air Max</option>
                    <option value="Air Force">Air Force</option>
                    <option value="Running">Running</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                )}
                {filterType === "shoeType" && (
                  <select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
                  >
                    <option value="">-- 選擇對象 --</option>
                    <option value="adult">男裝 (Adult)</option>
                    <option value="womens">女裝 (Womens)</option>
                    <option value="kids">童裝 (Kids)</option>
                  </select>
                )}
                {filterType === "featured" && (
                  <input
                    type="text"
                    value="true"
                    disabled
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-100"
                  />
                )}
              </div>
            </div>
          )}

          {/* Manual Selection */}
          {selectionMode === "manual" && (
            <div className="bg-zinc-50 p-4 rounded-xl space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋產品..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              />
              <div className="text-sm text-zinc-500">
                已選擇 {selectedProductIds.length} 件產品
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredProducts.slice(0, 50).map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 p-2 hover:bg-zinc-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds((prev) => [...prev, p.id]);
                        } else {
                          setSelectedProductIds((prev) =>
                            prev.filter((id) => id !== p.id)
                          );
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-zinc-900 truncate flex-1">
                      {p.title}
                    </span>
                    <span className="text-xs text-zinc-500">{p.category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">啟用</span>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`w-12 h-6 rounded-full transition-colors ${
                active ? "bg-olive-600" : "bg-zinc-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  active ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 flex gap-2 justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-xl"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title}
            className="px-4 py-2 bg-olive-600 text-white rounded-xl hover:bg-olive-700 disabled:opacity-50"
          >
            {saving ? "儲存中..." : "儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Banner Edit Modal
function BannerModal({
  banner,
  isNew,
  saving,
  onSave,
  onClose,
}: {
  banner: Banner;
  isNew: boolean;
  saving: boolean;
  onSave: (b: Partial<Banner>) => void;
  onClose: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(banner.imageUrl);
  const [title, setTitle] = useState(banner.title || "");
  const [subtitle, setSubtitle] = useState(banner.subtitle || "");
  const [linkUrl, setLinkUrl] = useState(banner.linkUrl || "");
  const [position, setPosition] = useState(banner.position);
  const [active, setActive] = useState(banner.active);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.data?.url) {
        setImageUrl(data.data.url);
      } else {
        alert("上傳失敗");
      }
    } catch {
      alert("上傳失敗");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave({
      id: banner.id || undefined,
      imageUrl,
      title: title || null,
      subtitle: subtitle || null,
      linkUrl: linkUrl || null,
      position,
      active,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="font-semibold text-lg">
            {isNew ? "新增 Banner" : "編輯 Banner"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Banner 圖片
            </label>
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-zinc-50 rounded-lg">
                  <ImageIcon size={32} className="text-zinc-400 mb-2" />
                  <span className="text-sm text-zinc-500">
                    {uploading ? "上傳中..." : "點擊上傳圖片"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="或貼上圖片 URL"
              className="w-full mt-2 px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              標題 (選填)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              placeholder="例如：最新波鞋"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              副標題 (選填)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              placeholder="例如：正品保證 · 免運費滿$600"
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              連結 URL (選填)
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              placeholder="例如：/products?category=Air+Jordan"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              位置
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPosition("hero")}
                className={`flex-1 px-4 py-2 rounded-xl border ${
                  position === "hero"
                    ? "border-olive-600 bg-olive-50 text-olive-700"
                    : "border-zinc-200 text-zinc-700"
                }`}
              >
                Hero (頂部)
              </button>
              <button
                type="button"
                onClick={() => setPosition("mid")}
                className={`flex-1 px-4 py-2 rounded-xl border ${
                  position === "mid"
                    ? "border-olive-600 bg-olive-50 text-olive-700"
                    : "border-zinc-200 text-zinc-700"
                }`}
              >
                Mid (中間)
              </button>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">啟用</span>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`w-12 h-6 rounded-full transition-colors ${
                active ? "bg-olive-600" : "bg-zinc-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  active ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 flex gap-2 justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-xl"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !imageUrl}
            className="px-4 py-2 bg-olive-600 text-white rounded-xl hover:bg-olive-700 disabled:opacity-50"
          >
            {saving ? "儲存中..." : "儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}
