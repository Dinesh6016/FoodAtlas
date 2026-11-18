import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, FileText } from "lucide-react";

interface LegalPageProps {
  params: Promise<{ slug: string }>;
}

const legalDocs: Record<string, { title: string; subtitle: string; content: string[] }> = {
  terms: {
    title: "Terms of Service",
    subtitle: "Effective as of 2026. Please read carefully before using FoodAtlas services.",
    content: [
      "1. Acceptance of Terms: By accessing and using FoodAtlas, you agree to be bound by these Terms of Service and all applicable Indian laws and regulations.",
      "2. Platform Discovery: FoodAtlas serves as an informational restaurant discovery and menu browsing portal. Menu items, prices, and availability are provided by partner restaurants and community verifications.",
      "3. Account Responsibility: Users and restaurant owners are responsible for maintaining the confidentiality of their credentials and all activities occurring under their accounts.",
      "4. Digital Menus & QR Codes: QR codes generated via FoodAtlas are provided for patron browsing. Restaurants must ensure prices accurately reflect in-store pricing.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "How FoodAtlas collects, protects, and handles your information.",
    content: [
      "1. Information Collected: We collect minimal personal data including name, email address, optional contact phone, and dining favorites to provide tailored culinary recommendations.",
      "2. Location Data: When enabled by the user, location coordinates are utilized strictly to calculate distance from restaurants and display nearby dining options.",
      "3. Data Sharing & Security: FoodAtlas never sells personal user data to third-party marketers. Session security employs encrypted tokens and industry-standard security protections.",
      "4. User Rights: Users may review, update, or request deletion of their account profile and saved favorites at any time through account settings.",
    ],
  },
  "content-policy": {
    title: "Content & Review Policy",
    subtitle: "Guidelines for diner reviews, ratings, and restaurant information.",
    content: [
      "1. Authentic Dining Experiences: Reviews must reflect real personal experiences. Promotional content by competitors or fraudulent reviews are prohibited.",
      "2. Respectful Communication: Defamatory, abusive, hate-speech, or obscene remarks will be immediately flagged and permanently removed by moderators.",
      "3. Restaurant Rights: Restaurant owners may submit official clarification responses to diner feedback via the owner portal.",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    subtitle: "Details about cookies and local storage tokens used on FoodAtlas.",
    content: [
      "1. Essential Cookies: FoodAtlas uses secure session cookies to remember authentication state and maintain user security.",
      "2. Preference Storage: Non-sensitive preferences such as your currently selected city (Hyderabad, Bengaluru, Mumbai) are stored for convenient browsing.",
      "3. Control: You can modify browser cookie preferences at any time through standard browser configuration.",
    ],
  },
};

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const doc = legalDocs[slug];

  if (!doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-orange-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-6 space-y-2">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>FoodAtlas Legal & Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {doc.title}
            </h1>
            <p className="text-xs text-stone-500">{doc.subtitle}</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            {doc.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-wrap gap-4 text-xs text-stone-500">
            <Link href="/legal/terms" className="hover:text-orange-600">Terms of Service</Link>
            <Link href="/legal/privacy" className="hover:text-orange-600">Privacy Policy</Link>
            <Link href="/legal/content-policy" className="hover:text-orange-600">Content Policy</Link>
            <Link href="/legal/cookies" className="hover:text-orange-600">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
