"use client";

import React, { useState } from "react";
import { Plus, Utensils, Flame, X, Check, AlertCircle } from "lucide-react";
import { MenuItemCard } from "@/components/menu/menu-item-card";

interface MenuEditorClientProps {
  restaurantId: string;
  initialCategories: any[];
}

export function MenuEditorClient({ restaurantId, initialCategories }: MenuEditorClientProps) {
  const [categories, setCategories] = useState(initialCategories);

  // Category creation state
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  // Item creation state
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || "");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [isVeg, setIsVeg] = useState(false);
  const [isEgg, setIsEgg] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);
  const [itemImage, setItemImage] = useState("");
  const [itemLoading, setItemLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setCatLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName.trim(),
          description: catDesc.trim() || undefined,
          displayOrder: categories.length + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create category");

      setCategories([...categories, { ...data.data, items: [] }]);
      setCatName("");
      setCatDesc("");
      setShowCatModal(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCatLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice || !selectedCatId) return;
    setItemLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/menu/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCatId,
          name: itemName.trim(),
          price: Number(itemPrice),
          description: itemDesc.trim() || undefined,
          veg: isVeg,
          egg: isEgg,
          spicy: isSpicy,
          image: itemImage.trim() || undefined,
          available: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create menu item");

      // Update state
      setCategories(
        categories.map((c) => {
          if (c.id === selectedCatId) {
            return {
              ...c,
              items: [...(c.items || []), data.data],
            };
          }
          return c;
        })
      );

      setItemName("");
      setItemPrice("");
      setItemDesc("");
      setItemImage("");
      setIsVeg(false);
      setIsEgg(false);
      setIsSpicy(false);
      setShowItemModal(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setItemLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
        <div className="text-xs text-stone-500">
          Total Categories: <span className="font-bold text-stone-900">{categories.length}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCatModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => {
              if (categories.length > 0) {
                setSelectedCatId(categories[0].id);
                setShowItemModal(true);
              }
            }}
            disabled={categories.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dish / Item</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Categories & Items Listing */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Your menu is currently empty</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Get started by adding categories like &apos;Starters&apos;, &apos;Main Course&apos;, or &apos;Chef Specials&apos;.
          </p>
          <button
            onClick={() => setShowCatModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-black text-lg text-stone-900">{cat.name}</h3>
                  {cat.description && <p className="text-xs text-stone-500">{cat.description}</p>}
                </div>

                <button
                  onClick={() => {
                    setSelectedCatId(cat.id);
                    setShowItemModal(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to {cat.name}</span>
                </button>
              </div>

              {cat.items?.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-2">
                  No items in this category yet. Tap &apos;Add to {cat.name}&apos; to add dishes.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((item: any) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Category */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-stone-900">Create Menu Category</h3>
              <button onClick={() => setShowCatModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Tandoor Starters, Biryanis, Mocktails"
                  required
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="e.g. Char-grilled skewers and fresh appetizers"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catLoading}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {catLoading ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Menu Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-stone-900">Add Menu Item</h3>
              <button onClick={() => setShowItemModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Category
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Paneer Tikka Butter Masala"
                  required
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Price (₹ INR)
                </label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="340"
                  required
                  min="0"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none"
                />
              </div>

              {/* Diet badges toggles */}
              <div className="grid grid-cols-3 gap-2">
                <label
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    isVeg ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="veg-badge" />
                  <span>Pure Veg</span>
                </label>

                <label
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    isEgg ? "bg-amber-50 border-amber-500 text-amber-800" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isEgg}
                    onChange={(e) => setIsEgg(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="egg-badge" />
                  <span>Contains Egg</span>
                </label>

                <label
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    isSpicy ? "bg-red-50 border-red-500 text-red-800" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSpicy}
                    onChange={(e) => setIsSpicy(e.target.checked)}
                    className="sr-only"
                  />
                  <Flame className="w-3.5 h-3.5 text-red-600" />
                  <span>Spicy</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Ingredients, preparation style, and portion notes..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={itemLoading}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {itemLoading ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
