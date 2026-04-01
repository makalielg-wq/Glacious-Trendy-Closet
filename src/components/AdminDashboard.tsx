import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, DollarSign, Tag, Package, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp, handleFirestoreError, OperationType, deleteField } from '../firebase';
import { Product } from '../types';
import { PRODUCTS, CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { useAuth } from '../AuthContext';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        if (docs.length > 0) {
          setProducts(docs);
        } else {
          setProducts(PRODUCTS);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [profile, navigate]);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const finalData: any = {
        ...formData,
        price: Number(formData.price),
      };

      if (editingId) {
        finalData.originalPrice = formData.originalPrice ? Number(formData.originalPrice) : deleteField();
        const productRef = doc(db, 'products', editingId);
        await updateDoc(productRef, finalData);
        setProducts(products.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
      } else {
        if (formData.originalPrice) {
          finalData.originalPrice = Number(formData.originalPrice);
        }
        const docRef = await addDoc(collection(db, 'products'), {
          ...finalData,
          rating: 0,
          reviewsCount: 0,
          inStock: true,
          createdAt: serverTimestamp(),
          images: formData.images || [],
          sizes: formData.sizes || ['S', 'M', 'L', 'XL'],
          colors: formData.colors || ['Black', 'White'],
        });
        setProducts([{ id: docRef.id, ...formData } as Product, ...products]);
      }
      handleCancel();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'products');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), base64String]
      }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 px-4">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Admin Dashboard</h1>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-100 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Product List */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <AnimatePresence>
          {(isAdding || editingId) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                  {isAdding ? 'Add New Product' : 'Edit Product'}
                </h2>
                <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Images Section */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Product Images</label>
                  <div className="grid grid-cols-4 gap-3">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100">
                        <img src={img} alt="Product" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-[8px] font-black text-gray-400 uppercase">Upload</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Product Name</label>
                    <input 
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. Summer Dress"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Category</label>
                    <select 
                      value={formData.category || ''}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Price ($)</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number"
                        value={formData.price || ''}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-pink-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Original Price (Optional)</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number"
                        value={formData.originalPrice || ''}
                        onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                        className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-pink-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Description</label>
                  <textarea 
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-pink-500 h-24 resize-none"
                    placeholder="Describe the product..."
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-pink-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-pink-100 active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save Product
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="px-6 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 group">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-pink-500 font-black text-sm">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-gray-300 text-[10px] line-through font-bold">${product.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 bg-gray-50 rounded text-[8px] font-black text-gray-400 uppercase tracking-widest">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-black">{product.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
