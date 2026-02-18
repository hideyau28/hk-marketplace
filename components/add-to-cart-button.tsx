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

export function AddToCartButton({ product, label, addedLabel, className, locale }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const { showToast } = useToast();
  const buttonClass =
    className ??
    "rounded-2xl bg-olive-600 px-4 py-3 text-white font-semibold hover:bg-olive-700";

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
    <button onClick={handleAddToCart} className={buttonClass}>
      {added ? addedLabel : label}
    </button>
  );
}
