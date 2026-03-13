import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Home,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend.d";
import {
  useAddToCart,
  useClearCart,
  useGetCart,
  useGetProducts,
  useRemoveFromCart,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

const PRODUCT_IMAGES: Record<number, string> = {
  0: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400",
  1: "https://images.unsplash.com/photo-1593032465171-8c6e2a9e2e3a?w=400",
  2: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
  3: "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=400",
};

const STAR_SLOTS = [0, 1, 2, 3, 4];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {STAR_SLOTS.map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-orange text-orange"
              : "fill-muted text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync(product.id);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const priceRupees = Math.round(Number(product.price) / 100);
  const imageUrl = PRODUCT_IMAGES[index % 4];
  const ocidIndex = index + 1;

  return (
    <div
      data-ocid={`products.item.${ocidIndex}`}
      className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover hover:scale-[1.03] transition-all duration-300 flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-52 object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-card-foreground text-sm mb-1 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
          {product.description}
        </p>
        <StarRating rating={Number(product.rating)} />
        <p className="text-price-red font-bold text-xl mt-2">₹{priceRupees}</p>
        <Button
          data-ocid={`product.add_button.${ocidIndex}`}
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
          className="mt-3 w-full bg-orange hover:bg-orange/90 text-foreground font-semibold"
        >
          {addToCart.isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-card flex flex-col">
      <Skeleton className="w-full h-52" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-full mt-1" />
      </div>
    </div>
  );
}

function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: cartItems = [], isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  const total = cartItems.reduce(
    (sum, ci) => sum + (Number(ci.product.price) / 100) * Number(ci.quantity),
    0,
  );

  const handleRemove = async (productId: bigint, name: string) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success(`${name} removed from cart.`);
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  const handleClear = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success("Cart cleared.");
    } catch {
      toast.error("Failed to clear cart.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="cart.sheet"
        side="right"
        className="w-full sm:max-w-md bg-card p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl text-card-foreground">
              Your Cart
            </SheetTitle>
            <SheetClose data-ocid="cart.close_button" asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div
            data-ocid="cart.loading_state"
            className="flex-1 flex items-center justify-center"
          >
            <div className="space-y-3 w-full px-5 pt-5">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div
            data-ocid="cart.empty_state"
            className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground"
          >
            <ShoppingBag className="w-12 h-12 opacity-30" />
            <p className="text-sm">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-5">
              <div className="py-4 space-y-3">
                {cartItems.map((ci, idx) => {
                  const ocidIdx = idx + 1;
                  const priceRupees = Math.round(
                    Number(ci.product.price) / 100,
                  );
                  const imgUrl = PRODUCT_IMAGES[Number(ci.product.id) % 4];
                  return (
                    <div
                      key={ci.product.id.toString()}
                      data-ocid={`cart.item.${ocidIdx}`}
                      className="flex gap-3 items-start"
                    >
                      <img
                        src={imgUrl}
                        alt={ci.product.name}
                        className="w-16 h-16 object-cover rounded-md shrink-0 border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground leading-tight line-clamp-2">
                          {ci.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {Number(ci.quantity)}
                        </p>
                        <p className="text-price-red font-bold text-sm mt-0.5">
                          ₹{priceRupees * Number(ci.quantity)}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-ocid={`cart.delete_button.${ocidIdx}`}
                        onClick={() =>
                          handleRemove(ci.product.id, ci.product.name)
                        }
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="px-5 pb-5 pt-3 border-t border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-card-foreground">
                  Total
                </span>
                <span className="text-price-red font-bold text-xl">
                  ₹{Math.round(total)}
                </span>
              </div>
              <Separator />
              <Button
                data-ocid="cart.clear_button"
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleClear}
                disabled={clearCart.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {clearCart.isPending ? "Clearing..." : "Clear Cart"}
              </Button>
              <Button className="w-full bg-orange hover:bg-orange/90 text-foreground font-semibold">
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function AppContent() {
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const { data: products = [], isLoading, isError } = useGetProducts();
  const { data: cartItems = [] } = useGetCart();

  const cartCount = cartItems.reduce((sum, ci) => sum + Number(ci.quantity), 0);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER */}
      <header className="bg-header sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <div className="font-display text-2xl font-bold text-orange shrink-0">
            Urban Langot
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              data-ocid="header.search_input"
              type="text"
              placeholder="Search Urban Langot products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white text-foreground border-0 focus-visible:ring-orange h-9"
            />
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              data-ocid="nav.home_link"
              href="/"
              className="flex items-center gap-1.5 text-header-foreground hover:text-orange text-sm px-3 py-1.5 rounded transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </a>
            <a
              data-ocid="nav.products_link"
              href="#products"
              className="flex items-center gap-1.5 text-header-foreground hover:text-orange text-sm px-3 py-1.5 rounded transition-colors"
            >
              <Package className="w-4 h-4" />
              Products
            </a>
            <a
              data-ocid="nav.account_link"
              href="/account"
              className="flex items-center gap-1.5 text-header-foreground hover:text-orange text-sm px-3 py-1.5 rounded transition-colors"
            >
              <User className="w-4 h-4" />
              Account
            </a>
          </nav>

          {/* Cart button */}
          <button
            type="button"
            data-ocid="header.cart_button"
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-header-foreground hover:text-orange transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-orange text-foreground border-0">
                {cartCount}
              </Badge>
            )}
          </button>

          {/* Mobile cart button */}
          <button
            type="button"
            data-ocid="nav.cart_link"
            onClick={() => setCartOpen(true)}
            className="md:hidden flex items-center gap-1 text-header-foreground hover:text-orange text-sm"
          >
            Cart
          </button>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ minHeight: "340px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        <div className="relative z-10 text-center px-6 py-16">
          <p className="text-orange text-sm font-semibold uppercase tracking-widest mb-3">
            New Collection 2026
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            Premium Comfort
            <br />
            <span className="text-orange">Underwear</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl">
            Crafted for everyday excellence
          </p>
          <a
            href="#products"
            className="mt-8 inline-block bg-orange hover:bg-orange/90 text-foreground font-semibold px-8 py-3 rounded-full text-base transition-all hover:scale-105"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* PRODUCTS */}
      <main
        id="products"
        className="flex-1 max-w-7xl mx-auto w-full px-4 py-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Featured Products
          </h2>
          {search && (
            <p className="text-muted-foreground text-sm">
              {filteredProducts.length} result
              {filteredProducts.length !== 1 ? "s" : ""} for &ldquo;{search}
              &rdquo;
            </p>
          )}
        </div>

        {isLoading && (
          <div
            data-ocid="products.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {[1, 2, 3, 4].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div
            data-ocid="products.error_state"
            className="text-center py-16 text-destructive"
          >
            <p className="font-semibold text-lg">Failed to load products.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please refresh and try again.
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <div
            data-ocid="products.list"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto opacity-30 mb-3" />
                <p>No products match your search.</p>
              </div>
            ) : (
              filteredProducts.map((product, idx) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={idx}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-header text-header-foreground text-center py-6 mt-8">
        <p className="text-sm text-white/70">
          &copy; {new Date().getFullYear()} Urban Langot | All Rights Reserved
        </p>
        <p className="text-xs text-white/40 mt-1">
          Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-orange transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* CART SHEET */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
