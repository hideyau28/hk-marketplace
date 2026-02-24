"use client";

import { useState } from "react";
import { addToCart, type CartItem } from "@/lib/cart";
import { useToast } from "@/components/Toast";

type AddToCartButtonProps = {
  product: {
    id: string;
    title: string;
    price: number;
    image?: string;
  };
  label: string;
  addedLabel: string;
  className?: string;
  locale?: string;
};

export function AddToCartButton({
  product,
  label,
  addedLabel,
  className,
  locale,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const { showToast } = useToast();
  const useDefault = !className;
  const buttonClass =
    className ?? "rounded-2xl px-4 py-3 text-white font-semibold";

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      unitPrice: product.price,
      imageUrl: product.image,
    });
    setAdded(true);
    showToast(locale === "zh-HK" ? "已加入購物車" : "Added to cart!");
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={buttonClass}
      style={
        useDefault
          ? { backgroundColor: "var(--tmpl-accent, #5c7c3a)" }
          : undefined
      }
    >
      {added ? addedLabel : label}
    </button>
  );
}
