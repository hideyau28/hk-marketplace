"use client";

import { useState, useMemo } from "react";
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
  LayoutGrid,
  ImageIcon as BannerIcon,
  Search,
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
  shoeType: string | null;
  sku: string | null;
};

type HomepageItem =
  | { type: "section"; data: Section }
  | { type: "banner"; data: Banner };

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
}: Props) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [banners, setBanners] = useState(initialBanners);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isCreatingBanner, setIsCreatingBanner] = useState(false);
  const [saving, setSaving] = useState(false);

  // Combine sections and banners into unified list sorted by sortOrder
  const unifiedList = useMemo(() => {
    const items: HomepageItem[] = [
      ...sections.map((s) => ({ type: "section" as const, data: s })),
      ...banners.map((b) => ({ type: "banner" as const, data: b })),
    ];
    return items.sort((a, b) => a.data.sortOrder - b.data.sortOrder);
  }, [sections, banners]);

  // Get next available sortOrder
  const getNextSortOrder = () => {
    const maxSection = Math.max(0, ...sections.map((s) => s.sortOrder));
    const maxBanner = Math.max(0, ...banners.map((b) => b.sortOrder));
    return Math.max(maxSection, maxBanner) + 1;
  };

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
      const sectionsRes = await fetch("/api/homepage/sections");
      const sectionsData = await sectionsRes.json();
      if (sectionsData.ok) setSections(sectionsData.data.sections);
    } catch {
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
      const bannersRes = await fetch("/api/homepage/banners");
      const bannersData = await bannersRes.json();
      if (bannersData.ok) setBanners(bannersData.data.banners);
    } catch {
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

  // Move item up/down in unified list
  const moveItem = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === unifiedList.length - 1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const item1 = unifiedList[index];
    const item2 = unifiedList[swapIndex];

    const newOrder1 = item2.data.sortOrder;
    const newOrder2 = item1.data.sortOrder;

    if (item1.type === "section") {
      setSections((prev) =>
        prev.map((s) =>
          s.id === item1.data.id ? { ...s, sortOrder: newOrder1 } : s
        )
      );
    } else {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === item1.data.id ? { ...b, sortOrder: newOrder1 } : b
        )
      );
    }

    if (item2.type === "section") {
      setSections((prev) =>
        prev.map((s) =>
          s.id === item2.data.id ? { ...s, sortOrder: newOrder2 } : s
        )
      );
    } else {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === item2.data.id ? { ...b, sortOrder: newOrder2 } : b
        )
      );
    }

    const updates: Promise<Response>[] = [];

    if (item1.type === "section") {
      updates.push(
        fetch(`/api/homepage/sections/${item1.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: newOrder1 }),
        })
      );
    } else {
      updates.push(
        fetch(`/api/homepage/banners/${item1.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: newOrder1 }),
        })
      );
    }

    if (item2.type === "section") {
      updates.push(
        fetch(`/api/homepage/sections/${item2.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: newOrder2 }),
        })
      );
    } else {
      updates.push(
        fetch(`/api/homepage/banners/${item2.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: newOrder2 }),
        })
      );
    }

    await Promise.all(updates);
  };

  const getSectionProductInfo = (section: Section) => {
    if (section.productIds && section.productIds.length > 0) {
      return `${section.productIds.length} products`;
    }
    if (section.filterType) {
      return section.filterValue || section.filterType;
    }
    return "0 products";
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setIsCreatingSection(true);
            setEditingSection({
              id: "",
              title: "",
              type: "product_grid",
              cardSize: "small",
              sortOrder: getNextSortOrder(),
              active: true,
              productIds: [],
              filterType: "category",
              filterValue: "",
            });
          }}
          className="flex items-center gap-1 px-4 py-2 bg-olive-600 text-white rounded-xl text-sm hover:bg-olive-700"
        >
          <Plus size={16} /> 新增 Section
        </button>
        <button
          onClick={() => {
            setIsCreatingBanner(true);
            setEditingBanner({
              id: "",
              imageUrl: "",
              title: "",
              subtitle: "",
              linkUrl: "",
              sortOrder: getNextSortOrder(),
              active: true,
              position: "hero",
            });
          }}
          className="flex items-center gap-1 px-4 py-2 bg-zinc-800 text-white rounded-xl text-sm hover:bg-zinc-900"
        >
          <Plus size={16} /> 新增 Banner
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="font-semibold text-zinc-900">首頁內容排序</h2>
          <p className="text-sm text-zinc-500 mt-1">
            拖拉或用箭嘴調整順序，順序即係首頁顯示嘅順序
          </p>
        </div>

        <div className="divide-y divide-zinc-200">
          {unifiedList.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              未有任何內容，請新增 Section 或 Banner
            </div>
          )}

          {unifiedList.map((item, index) => (
            <div
              key={`${item.type}-${item.data.id}`}
              className="flex items-center gap-3 p-4 hover:bg-zinc-50"
            >
              <GripVertical size={20} className="text-zinc-300 cursor-grab" />

              {item.type === "section" ? (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                  <LayoutGrid size={14} />
                  Section
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                  <BannerIcon size={14} />
                  Banner
                </div>
              )}

              <div className="flex-1 min-w-0">
                {item.type === "section" ? (
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-zinc-900 truncate">
                      {(item.data as Section).title}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {(item.data as Section).cardSize === "large" ? "大卡" : "細卡"} ·{" "}
                      {getSectionProductInfo(item.data as Section)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-10 rounded overflow-hidden bg-zinc-100 flex-shrink-0">
                      {(item.data as Banner).imageUrl ? (
                        <img
                          src={(item.data as Banner).imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={16} className="text-zinc-400" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-zinc-900 truncate">
                      {(item.data as Banner).title || "(無標題)"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  className="p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  onClick={() => moveItem(index, "down")}
                  disabled={index === unifiedList.length - 1}
                  className="p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              <button
                onClick={() =>
                  item.type === "section"
                    ? toggleSectionActive(item.data as Section)
                    : toggleBannerActive(item.data as Banner)
                }
                className={`px-2 py-1 rounded text-xs font-medium ${
                  item.data.active
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {item.data.active ? "啟用" : "停用"}
              </button>

              <button
                onClick={() => {
                  if (item.type === "section") {
                    setEditingSection(item.data as Section);
                    setIsCreatingSection(false);
                  } else {
                    setEditingBanner(item.data as Banner);
                    setIsCreatingBanner(false);
                  }
                }}
                className="p-2 text-zinc-400 hover:text-zinc-600"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() =>
                  item.type === "section"
                    ? deleteSection(item.data.id)
                    : deleteBanner(item.data.id)
                }
                className="p-2 text-zinc-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

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
  const [shoeTypeFilter, setShoeTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSku = p.sku?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSku) return false;
      }

      if (shoeTypeFilter !== "all") {
        const KIDS_TYPES = ["grade_school", "preschool", "toddler"];
        if (shoeTypeFilter === "kids") {
          if (!KIDS_TYPES.includes(p.shoeType || "")) return false;
        } else if (shoeTypeFilter === "mens") {
          if (p.shoeType !== "adult") return false;
        } else if (shoeTypeFilter === "womens") {
          if (p.shoeType !== "womens") return false;
        }
      }

      if (categoryFilter !== "all") {
        if (p.category !== categoryFilter) return false;
      }

      return true;
    });
  }, [products, searchQuery, shoeTypeFilter, categoryFilter]);

  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

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

  const toggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    } else {
      setSelectedProductIds((prev) => [...prev, productId]);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-lg">
            {isNew ? "新增 Section" : "編輯 Section"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              placeholder="例如：Air Jordan 系列"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">卡片大小</label>
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

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">產品選擇方式</label>
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

          {selectionMode === "auto" && (
            <div className="space-y-3 bg-zinc-50 p-4 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">篩選類型</label>
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
                <label className="block text-sm font-medium text-zinc-700 mb-1">篩選值</label>
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
                    <option value="Training">Training</option>
                    <option value="Sandals">Sandals</option>
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

          {selectionMode === "manual" && (
            <div className="bg-zinc-50 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">
                  已選擇 {selectedProductIds.length} 件產品
                </span>
                {selectedProductIds.length > 0 && (
                  <button
                    onClick={() => setSelectedProductIds([])}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    清除全部
                  </button>
                )}
              </div>

              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-zinc-200">
                  {selectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 bg-olive-50 pl-1 pr-2 py-1 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded overflow-hidden bg-zinc-100">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={12} className="text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-zinc-700 max-w-[100px] truncate">{p.title}</span>
                      <button onClick={() => toggleProduct(p.id)} className="text-zinc-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "全部" },
                  { value: "mens", label: "男裝" },
                  { value: "womens", label: "女裝" },
                  { value: "kids", label: "童裝" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setShoeTypeFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      shoeTypeFilter === opt.value
                        ? "bg-olive-600 text-white"
                        : "bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500"
                >
                  <option value="all">所有類別</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋產品名或 SKU..."
                    className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500"
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1 bg-white rounded-lg border border-zinc-200">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-zinc-500 text-sm">搵唔到符合條件嘅產品</div>
                ) : (
                  filteredProducts.slice(0, 100).map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 p-2 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
                        className="rounded border-zinc-300 text-olive-600 focus:ring-olive-500"
                      />
                      <div className="w-10 h-10 rounded overflow-hidden bg-zinc-100 flex-shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={16} className="text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-900 truncate">{p.title}</div>
                        <div className="text-xs text-zinc-500">
                          {p.sku && <span>{p.sku} · </span>}
                          {p.category}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 flex-shrink-0">
                        {p.shoeType === "adult"
                          ? "男裝"
                          : p.shoeType === "womens"
                            ? "女裝"
                            : ["grade_school", "preschool", "toddler"].includes(p.shoeType || "")
                              ? "童裝"
                              : ""}
                      </span>
                    </label>
                  ))
                )}
              </div>
              {filteredProducts.length > 100 && (
                <p className="text-xs text-zinc-500 text-center">
                  顯示首 100 件產品，請使用篩選或搜尋縮窄範圍
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">啟用</span>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`w-12 h-6 rounded-full transition-colors ${active ? "bg-olive-600" : "bg-zinc-300"}`}
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
          <button onClick={onClose} className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-xl">取消</button>
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
  const [active, setActive] = useState(banner.active);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
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
      active,
      position: "hero",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="font-semibold text-lg">{isNew ? "新增 Banner" : "編輯 Banner"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Banner 圖片</label>
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4">
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="" className="w-full h-40 object-cover rounded-lg" />
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
                  <span className="text-sm text-zinc-500">{uploading ? "上傳中..." : "點擊上傳圖片"}</span>
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

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">標題 (選填)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              placeholder="例如：最新波鞋"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">副標題 (選填)</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              placeholder="例如：正品保證 · 免運費滿$600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">連結 URL (選填)</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
              placeholder="例如：/products?category=Air+Jordan"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">啟用</span>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`w-12 h-6 rounded-full transition-colors ${active ? "bg-olive-600" : "bg-zinc-300"}`}
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
          <button onClick={onClose} className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-xl">取消</button>
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
