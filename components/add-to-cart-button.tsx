"use client";

import { useState } from "react";
import { addToCart, type CartItem } from "@/lib/cart";
import Toast from "@/components/Toast";

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
};

export function AddToCartButton({ product, label, addedLabel, className }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      unitPrice: product.price,
      imageUrl: product.image,
    });
    setAdded(true);
    setShowToast(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <button onClick={handleAddToCart} className={className}>
        {added ? addedLabel : label}
      </button>
      <Toast message="✓ 已加入購物車" show={showToast} onClose={() => setShowToast(false)} />
    </>
  );
}
