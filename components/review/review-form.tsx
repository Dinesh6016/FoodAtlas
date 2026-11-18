"use client";

import React, { useState } from "react";
import { Star, Send } from "lucide-react";

interface ReviewFormProps {
  restaurantId: string;
  onReviewSubmitted?: (newReview: any) => void;
}

export function ReviewForm({ restaurantId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || body.length < 5) {
      setError("Please write at least a sentence about your dining experience.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to submit review");
      }

      setSuccess(true);
      setTitle("");
      setBody("");
      if (onReviewSubmitted) {
        onReviewSubmitted(data.data);
      }
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to post review. Please check your login status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-stone-900 mb-2">Write a Review</h3>
      <p className="text-xs text-stone-500 mb-4">
        Help fellow food enthusiasts discover great food with your honest feedback.
      </p>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
          🎉 Thank you! Your review has been submitted and verified.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Picker */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Your Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-stone-600 ml-2">
              {rating === 5 ? "Exceptional" : rating === 4 ? "Very Good" : rating === 3 ? "Average" : "Needs Improvement"}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Unforgettable Biryani & Great Ambience"
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Your Experience
          </label>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share details about the dishes you ordered, flavor profile, portion size, and service..."
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? "Posting..." : "Submit Review"}</span>
        </button>
      </form>
    </div>
  );
}
