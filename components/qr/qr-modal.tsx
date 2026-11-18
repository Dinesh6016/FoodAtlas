"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Download, X, Copy, Check } from "lucide-react";

interface QRModalProps {
  restaurantSlug: string;
  restaurantName: string;
}

export function QRModal({ restaurantSlug, restaurantName }: QRModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const menuUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/menu/${restaurantSlug}`
      : `https://foodatlas.in/menu/${restaurantSlug}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#1c1917",
          light: "#ffffff",
        },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [isOpen, menuUrl]);

  const copyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
      >
        <QrCode className="w-4 h-4 text-orange-600" />
        <span>Scan QR Menu</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-stone-200 relative text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-lg text-stone-900">{restaurantName}</h3>
            <p className="text-xs text-stone-500 mb-6">
              Scan this QR code with any smartphone camera to open the instant digital menu.
            </p>

            {qrDataUrl && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block mb-6 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR Code Menu" className="w-48 h-48 mx-auto" />
              </div>
            )}

            <div className="flex gap-2">
              <a
                href={qrDataUrl}
                download={`${restaurantSlug}-menu-qr.png`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </a>

              <button
                onClick={copyLink}
                className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
