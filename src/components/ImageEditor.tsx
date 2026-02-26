import { useState } from 'react';
import { Product } from '../types';
import { X, Wand2, Loader2, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface ImageEditorProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newImageUrl: string) => void;
}

export default function ImageEditor({ product, isOpen, onClose, onSave }: ImageEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(product.image);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Fetch the image and convert to base64
      const imageResponse = await fetch(product.image);
      const blob = await imageResponse.blob();
      const reader = new FileReader();
      
      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: `Edit this product image of ${product.name} based on this request: ${prompt}. Return only the edited image.`,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          setPreviewUrl(imageUrl);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error('Gagal menghasilkan gambar baru. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error('Gemini Error:', err);
      setError(err.message || 'Terjadi kesalahan saat mengedit gambar.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setPreviewUrl(product.image);
    setPrompt('');
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col md:flex-row"
          >
            <div className="md:w-1/2 bg-gray-100 relative aspect-square md:aspect-auto">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-sm font-medium text-gray-600">Sedang mengolah...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI Image Editor</h2>
                  <p className="text-xs text-gray-500">Edit gambar produk dengan prompt teks</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instruksi Edit</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Contoh: Tambahkan hiasan sayuran segar di sampingnya, atau buat pencahayaan lebih cerah..."
                  className="w-full h-32 p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none transition-all"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                  Generate Gambar
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={reset}
                    className="py-3 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={() => onSave(previewUrl)}
                    disabled={previewUrl === product.image}
                    className="py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
