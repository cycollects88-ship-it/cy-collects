import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProductContext } from "../../contexts/ProductContext";
import { useCategoryContext } from "../../contexts/CategoryContext";
import { Product, ProductInsert, ProductUpdate } from "../../contexts/ProductContext";
import { Category } from "../../contexts/CategoryContext";
import { supabase } from "../../utils/supabase-client";
import ConfirmDialog from "../../components/ConfirmDialog";
import AlertDialog from "../../components/AlertDialog";

// Trading card conditions (standard grading scale)
const CARD_CONDITIONS = [
  "Mint (M)",
  "Near Mint (NM)", 
  "Lightly Played (LP)",
  "Moderately Played (MP)",
  "Heavily Played (HP)",
  "Damaged (DMG)"
] as const;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// Helper function to upload image to Supabase storage
const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Upload with upsert option to handle permissions
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      // Try with public upload if regular upload fails
      const { error: publicUploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half'
        });
      
      if (publicUploadError) {
        console.error('Public upload also failed:', publicUploadError);
        return null;
      }
    }

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Exception uploading image:', error);
    return null;
  }
};

/**
 * Inventory Management Page
 * Allows admin to view, add, edit, and delete Pokemon card inventory items
 */
const InventoryPage: React.FC = () => {
  const { 
    loading: productsLoading, 
    products, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useProductContext();
  
  const { 
    loading: categoriesLoading, 
    categories 
  } = useCategoryContext();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<{ isOpen: boolean; message: string; variant: "success" | "error" }>({ isOpen: false, message: "", variant: "success" });

  // Filter products based on search and category
  const filteredItems = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get category name by ID
  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item: Product) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDeleteItem = (id: string) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      setIsSubmitting(true);
      const success = await deleteProduct(deleteTargetId);
      if (!success) {
        setShowAlert({ isOpen: true, message: "Failed to delete item. Please try again.", variant: "error" });
      }
      setIsSubmitting(false);
      setShowConfirmDelete(false);
      setDeleteTargetId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setDeleteTargetId(null);
  };

  const handleSaveItem = async (formData: Partial<ProductInsert>) => {
    setIsSubmitting(true);
    
    if (editingItem) {
      // Update existing item
      const success = await updateProduct(editingItem.id, formData as ProductUpdate);
      if (success) {
        setShowModal(false);
        // Product will be updated in context automatically
      } else {
        setShowAlert({ isOpen: true, message: "Failed to update item. Please try again.", variant: "error" });
      }
    } else {
      // Add new item
      const success = await createProduct(formData as ProductInsert);
      if (success) {
        setShowModal(false);
        // Product will be added to context automatically
      } else {
        setShowAlert({ isOpen: true, message: "Failed to create item. Please try again.", variant: "error" });
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Actions */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
            disabled={categoriesLoading}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <button
            onClick={handleAddItem}
            className="bg-[#7D78A3] hover:bg-[#A29CBB] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          <span>Add Item</span>
        </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                BND ${products.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Value Cards</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(item => (item.price || 0) >= 10000).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(products.map(item => item.category_id).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Items Table */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        variants={itemVariants}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Pokemon Cards ({filteredItems.length})
          </h3>
        </div>

        {productsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7D78A3] mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading cards...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {item.media_url_front ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={item.media_url_front}
                              alt={item.name || "Pokemon Card"}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name || "Unnamed Card"}</div>
                          <div className="text-sm text-gray-500">
                            Added {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getCategoryName(item.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      BND ${(item.price || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#7D78A3]/10 text-[#7D78A3]">
                        {item.condition || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {item.media_url_front && (
                          <div className="text-xs text-green-600">Front</div>
                        )}
                        {item.media_url_back && (
                          <div className="text-xs text-blue-600">Back</div>
                        )}
                        {!item.media_url_front && !item.media_url_back && (
                          <div className="text-xs text-gray-400">No images</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-[#7D78A3] hover:text-[#A29CBB] transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <InventoryModal
            item={editingItem}
            categories={categories}
            conditions={CARD_CONDITIONS}
            onSave={handleSaveItem}
            onClose={() => setShowModal(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlert.isOpen}
        title={showAlert.variant === "error" ? "Error" : "Success"}
        message={showAlert.message}
        variant={showAlert.variant}
        onClose={() => setShowAlert({ isOpen: false, message: "", variant: "success" })}
      />
    </motion.div>
  );
};

interface InventoryModalProps {
  item: Product | null;
  categories: Category[];
  conditions: readonly string[];
  onSave: (data: Partial<ProductInsert>) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ item, categories, conditions, onSave, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    price: item?.price || 0,
    condition: item?.condition || "Near Mint (NM)",
    category_id: item?.category_id || "",
    media_url_front: item?.media_url_front || "",
    media_url_back: item?.media_url_back || "",
  });

  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(item?.media_url_front || null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(item?.media_url_back || null);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });

  // Reset form data when item changes
  useEffect(() => {
    setFormData({
      name: item?.name || "",
      price: item?.price || 0,
      condition: item?.condition || "Near Mint (NM)",
      category_id: item?.category_id || "",
      media_url_front: item?.media_url_front || "",
      media_url_back: item?.media_url_back || "",
    });
    setFrontImageFile(null);
    setBackImageFile(null);
    setFrontImagePreview(item?.media_url_front || null);
    setBackImagePreview(item?.media_url_back || null);
  }, [item]);

  // Handle front image file selection
  const handleFrontImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setFrontImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle back image file selection
  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setBackImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalFormData = { ...formData };
    
    // Upload images if new files are selected
    if (frontImageFile || backImageFile) {
      setUploadingImages(true);
      
      try {
        // Upload front image if selected
        if (frontImageFile) {
          const frontUrl = await uploadImage(frontImageFile, 'cards/front');
          if (frontUrl) {
            finalFormData.media_url_front = frontUrl;
          } else {
            setShowAlert({ isOpen: true, message: 'Failed to upload front image. Please try again.' });
            setUploadingImages(false);
            return;
          }
        }
        
        // Upload back image if selected
        if (backImageFile) {
          const backUrl = await uploadImage(backImageFile, 'cards/back');
          if (backUrl) {
            finalFormData.media_url_back = backUrl;
          } else {
            setShowAlert({ isOpen: true, message: 'Failed to upload back image. Please try again.' });
            setUploadingImages(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        setShowAlert({ isOpen: true, message: 'Failed to upload images. Please try again.' });
        setUploadingImages(false);
        return;
      }
      
      setUploadingImages(false);
    }
    
    onSave(finalFormData);
  };

  return createPortal(
    <motion.div 
      className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border-0"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#7D78A3] to-[#A29CBB]">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              {item ? "✏️" : "➕"}
            </div>
            {item ? "Edit Pokemon Card" : "Add New Pokemon Card"}
          </h3>
          <p className="text-white text-opacity-80 mt-2">
            {item ? "Update your card details and images" : "Add a new card to your collection"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Card Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#7D78A3]/20 focus:border-[#7D78A3] transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="e.g., Charizard LV.X DP5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Price (BND $) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#7D78A3]/20 focus:border-[#7D78A3] transition-all duration-200 text-gray-800"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#7D78A3]/20 focus:border-[#7D78A3] transition-all duration-200 text-gray-800 bg-white"
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#7D78A3]/20 focus:border-[#7D78A3] transition-all duration-200 text-gray-800 bg-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Modern Image Upload Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#7D78A3] rounded-lg flex items-center justify-center text-white text-sm">📷</span>
              Card Images
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Front Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFrontImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                    frontImagePreview 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-[#7D78A3] hover:bg-[#7D78A3]/5'
                  }`}>
                    {frontImagePreview ? (
                      <div className="space-y-3">
                        <img 
                          src={frontImagePreview} 
                          alt="Front preview" 
                          className="w-full h-32 object-cover rounded-xl mx-auto"
                        />
                        <p className="text-sm text-green-600 font-medium">✓ Front image selected</p>
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Upload front image</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Back Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Back Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                    backImagePreview 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-[#7D78A3] hover:bg-[#7D78A3]/5'
                  }`}>
                    {backImagePreview ? (
                      <div className="space-y-3">
                        <img 
                          src={backImagePreview} 
                          alt="Back preview" 
                          className="w-full h-32 object-cover rounded-xl mx-auto"
                        />
                        <p className="text-sm text-green-600 font-medium">✓ Back image selected</p>
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Upload back image</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              disabled={isSubmitting || uploadingImages}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-[#7D78A3] to-[#A29CBB] text-white rounded-xl hover:from-[#6D68A3] hover:to-[#9289BB] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-medium shadow-lg hover:shadow-xl"
              disabled={isSubmitting || uploadingImages}
            >
              {(isSubmitting || uploadingImages) && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              )}
              <span>
                {uploadingImages ? "Uploading Images..." : `${item ? "Update" : "Add"} Card`}
              </span>
              {!isSubmitting && !uploadingImages && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Alert Dialog */}
        <AlertDialog
          isOpen={showAlert.isOpen}
          title="Error"
          message={showAlert.message}
          variant="error"
          onClose={() => setShowAlert({ isOpen: false, message: "" })}
        />
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default InventoryPage;
