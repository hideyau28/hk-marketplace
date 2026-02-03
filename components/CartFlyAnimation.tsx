"use client";

import { useEffect, useState, useCallback } from "react";

type FlyingItem = {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

// Global event for triggering cart fly animation
export const triggerCartFly = (imageUrl: string, startX: number, startY: number) => {
  window.dispatchEvent(
    new CustomEvent("cartFlyStart", {
      detail: { imageUrl, startX, startY },
    })
  );
};

// Called after animation completes to trigger cart icon bounce and toast
const triggerCartBounce = () => {
  window.dispatchEvent(new CustomEvent("cartBounce"));
  window.dispatchEvent(new CustomEvent("cartAnimationDone"));
  window.dispatchEvent(new CustomEvent("cartUpdated"));
};

export default function CartFlyAnimation() {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const handleFlyStart = useCallback((e: CustomEvent<{ imageUrl: string; startX: number; startY: number }>) => {
    const { imageUrl, startX, startY } = e.detail;

    // Find the cart icon in the nav (data attribute added to TopNav)
    const cartIcon = document.querySelector("[data-cart-icon]");
    if (!cartIcon) return;

    const cartRect = cartIcon.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    const id = `fly-${Date.now()}-${Math.random()}`;

    setFlyingItems((prev) => [
      ...prev,
      { id, imageUrl, startX, startY, endX, endY },
    ]);

    // Remove item and trigger bounce after animation completes
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
      triggerCartBounce();
    }, 600);
  }, []);

  useEffect(() => {
    window.addEventListener("cartFlyStart", handleFlyStart as EventListener);
    return () => {
      window.removeEventListener("cartFlyStart", handleFlyStart as EventListener);
    };
  }, [handleFlyStart]);

  return (
    <>
      {flyingItems.map((item) => (
        <div
          key={item.id}
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: item.startX,
            top: item.startY,
            animation: "cartFlyParabola 0.6s ease-in forwards",
            "--fly-end-x": `${item.endX - item.startX}px`,
            "--fly-end-y": `${item.endY - item.startY}px`,
          } as React.CSSProperties}
        >
          <div className="w-[30px] h-[30px] rounded-lg overflow-hidden bg-zinc-100 shadow-lg">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-300" />
            )}
          </div>
        </div>
      ))}

      <style jsx global>{`
        @keyframes cartFlyParabola {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(calc(var(--fly-end-x) * 0.5), calc(var(--fly-end-y) * 0.3 - 60px)) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(var(--fly-end-x), var(--fly-end-y)) scale(0.3);
            opacity: 0.8;
          }
        }

        @keyframes cartBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        .cart-bounce {
          animation: cartBounce 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
