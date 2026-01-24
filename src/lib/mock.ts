export const mockProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: `Product ${i + 1}`,
  price: 199 + i * 10,
  shopName: "Demo Shop",
  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60"
}));
