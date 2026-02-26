import { useState, useEffect } from 'react';
import { products as initialProducts } from './data/products';
import { Product, CartItem } from './types';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import ImageEditor from './components/ImageEditor';
import { ShoppingCart, Search, Menu, Home, Package, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['Semua', ...new Set(initialProducts.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveImage = (newImageUrl: string) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...p, image: newImageUrl } : p
      ));
      setEditingProduct(null);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Package className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Sembako Mart</h1>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari kebutuhan dapur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Banner */}
        <section className="mb-8">
          <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://picsum.photos/seed/grocery/1200/400"
              alt="Promo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 md:px-12 text-white">
              <span className="bg-emerald-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2 w-fit">
                Promo Spesial
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Diskon Sembako<br/>Hingga 30%</h2>
              <p className="text-sm text-gray-200 mb-4 max-w-xs">Penuhi kebutuhan dapur Anda dengan harga terbaik hari ini.</p>
              <button className="bg-white text-emerald-600 px-6 py-2 rounded-full font-bold text-sm w-fit hover:bg-emerald-50 transition-colors">
                Belanja Sekarang
              </button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-white text-gray-600 border border-black/5 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Produk Pilihan</h2>
            <button className="text-emerald-600 text-sm font-bold hover:underline">Lihat Semua</button>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onEditImage={(p) => setEditingProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p>Produk tidak ditemukan</p>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-6 py-3 flex items-center justify-between md:hidden z-40">
        <button className="flex flex-col items-center gap-1 text-emerald-600">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <Package className="w-6 h-6" />
          <span className="text-[10px] font-bold">Pesanan</span>
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-400 relative"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-[10px] font-bold">Keranjang</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </nav>

      {/* Components */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          alert('Terima kasih telah berbelanja! Fitur pembayaran akan segera hadir.');
          setCartItems([]);
          setIsCartOpen(false);
        }}
      />

      {editingProduct && (
        <ImageEditor
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveImage}
        />
      )}
    </div>
  );
}
