import React from "react";
import Image from "next/image";
import { Flame } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    discountedPrice?: number | null;
    veg: boolean;
    egg?: boolean;
    spicy?: boolean;
    available: boolean;
    image?: string | null;
  };
}

export function MenuItemCard({ item }: MenuItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-stone-200/80 bg-white hover:border-stone-300 hover:shadow-sm transition-all duration-200">
      {/* Item Details */}
      <div className="flex-1 min-w-0">
        {/* Diet & Spice Indicators */}
        <div className="flex items-center gap-2 mb-1.5">
          {item.egg ? (
            <span className="egg-badge" title="Egg" />
          ) : item.veg ? (
            <span className="veg-badge" title="Pure Vegetarian" />
          ) : (
            <span className="non-veg-badge" title="Non-Vegetarian" />
          )}

          {item.spicy && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded">
              <Flame className="w-3 h-3 fill-red-600 text-red-600" />
              <span>Spicy</span>
            </span>
          )}

          {!item.available && (
            <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
              Currently Unavailable
            </span>
          )}
        </div>

        {/* Item Name */}
        <h4 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
          {item.name}
        </h4>

        {/* Price & Discount */}
        <div className="flex items-baseline gap-2 mt-1 mb-1.5">
          {item.discountedPrice ? (
            <>
              <span className="font-bold text-stone-900 text-sm sm:text-base">
                {formatPrice(item.discountedPrice)}
              </span>
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(item.price)}
              </span>
            </>
          ) : (
            <span className="font-bold text-stone-900 text-sm sm:text-base">
              {formatPrice(item.price)}
            </span>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Image Thumbnail if available */}
      {item.image && (
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 shadow-inner">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="112px"
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
  );
}
