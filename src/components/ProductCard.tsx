import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

export interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onEditImage: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onEditImage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-square group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <button
          onClick={() => onEditImage(product)}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          title="Edit Gambar AI"
        >
          <Edit3 className="w-4 h-4 text-emerald-600" />
        </button>
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white uppercase font-bold tracking-wider">
          {product.category}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 leading-tight mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-emerald-600">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-gray-400 ml-1">/{product.unit}</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
