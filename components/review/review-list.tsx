import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string | Date;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface ReviewListProps {
  reviews: ReviewItem[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
        <p className="text-stone-500 text-sm">No reviews yet. Be the first to review this place!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {r.user?.avatarUrl ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-stone-100">
                  <Image src={r.user.avatarUrl} alt={r.user.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center">
                  {r.user?.name ? r.user.name.charAt(0) : "U"}
                </div>
              )}
              <div>
                <h5 className="font-semibold text-stone-900 text-sm">{r.user?.name || "Customer"}</h5>
                <span className="text-[11px] text-stone-400">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-900">{r.rating}.0</span>
            </div>
          </div>

          {r.title && <h6 className="font-bold text-stone-900 text-sm mb-1">{r.title}</h6>}
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{r.body}</p>
        </div>
      ))}
    </div>
  );
}
