import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useServiceContext, Service, ServiceInsert, ServiceUpdate } from "../../contexts/ServiceContext";
import { supabase } from "../../utils/supabase-client";
import ConfirmDialog from "../../components/ConfirmDialog";
import AlertDialog from "../../components/AlertDialog";

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

/**
 * Helper function to upload image to Supabase storage
 */
const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
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
 * Services Management Page
 * Allows admin to view, add, edit, and delete services
 */
const ServicesPage: React.FC = () => {
  const { 
    loading: servicesLoading, 
    services, 
    createService, 
    updateService, 
    deleteService 
  } = useServiceContext();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<{ isOpen: boolean; title: string; message: string; variant: "success" | "error" }>({ isOpen: false, title: "", message: "", variant: "success" });

  // Filter services based on search
  const filteredItems = services.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return matchesSearch;
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item: Service) => {
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
      const success = await deleteService(deleteTargetId);
      if (!success) {
        setShowAlert({ isOpen: true, title: "Error", message: "Failed to delete service. Please try again.", variant: "error" });
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

  const handleSaveItem = async (formData: Partial<ServiceInsert>) => {
    setIsSubmitting(true);
    
    if (editingItem) {
      // Update existing item
      const success = await updateService(editingItem.id, formData as ServiceUpdate);
      if (success) {
        setShowModal(false);
        // Service will be updated in context automatically
      } else {
        setShowAlert({ isOpen: true, title: "Error", message: "Failed to update service. Please try again.", variant: "error" });
      }
    } else {
      // Add new item
      const success = await createService(formData as ServiceInsert);
      if (success) {
        setShowModal(false);
        // Service will be added to context automatically
      } else {
        setShowAlert({ isOpen: true, title: "Error", message: "Failed to create service. Please try again.", variant: "error" });
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
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <button
          onClick={handleAddItem}
          className="bg-[#7D78A3] hover:bg-[#A29CBB] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Service</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
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
                BND ${services.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">
                BND ${services.length > 0 ? Math.round(services.reduce((sum, item) => sum + (item.price || 0), 0) / services.length).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Services Grid */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        variants={itemVariants}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Services ({filteredItems.length})
          </h3>
        </div>

        {servicesLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7D78A3] mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading services...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
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
                          {item.media_url ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={item.media_url}
                              alt={item.name || "Service"}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#7D78A3] to-[#A29CBB] flex items-center justify-center">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name || "Unnamed Service"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      BND ${(item.price || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
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
          <ServiceModal
            item={editingItem}
            onSave={handleSaveItem}
            onClose={() => setShowModal(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Service?"
        message="Are you sure you want to delete this service? This action cannot be undone."
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
        onClose={() => setShowAlert({ isOpen: false, title: "", message: "", variant: "success" })}
      />
    </motion.div>
  );
};

interface ServiceModalProps {
  item: Service | null;
  onSave: (data: Partial<ServiceInsert>) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ item, onSave, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    price: item?.price || 0,
    media_url: item?.media_url || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.media_url || null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });

  // Reset form data when item changes
  useEffect(() => {
    setFormData({
      name: item?.name || "",
      price: item?.price || 0,
      media_url: item?.media_url || "",
    });
    setImageFile(null);
    setImagePreview(item?.media_url || null);
  }, [item]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalFormData = { ...formData };
    
    // Upload image if new file is selected
    if (imageFile) {
      setUploadingImage(true);
      
      try {
        const imageUrl = await uploadImage(imageFile, 'services');
        if (imageUrl) {
          finalFormData.media_url = imageUrl;
        } else {
          setShowAlert({ isOpen: true, message: 'Failed to upload image. Please try again.' });
          setUploadingImage(false);
          return;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setShowAlert({ isOpen: true, message: 'Failed to upload image. Please try again.' });
        setUploadingImage(false);
        return;
      }
      
      setUploadingImage(false);
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
            {item ? "Edit Service" : "Add New Service"}
          </h3>
          <p className="text-white text-opacity-80 mt-2">
            {item ? "Update your service details and image" : "Add a new service to your offerings"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#7D78A3]/20 focus:border-[#7D78A3] transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="e.g., Card Authentication Service"
            />
          </div>

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

          {/* Image Upload Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#7D78A3] rounded-lg flex items-center justify-center text-white text-sm">📷</span>
              Service Image
            </h4>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                  imagePreview 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-[#7D78A3] hover:bg-[#7D78A3]/5'
                }`}>
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl mx-auto"
                      />
                      <p className="text-sm text-green-600 font-medium">✓ Image selected</p>
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
                        <p className="text-sm font-medium text-gray-700">Upload service image</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              disabled={isSubmitting || uploadingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-[#7D78A3] to-[#A29CBB] text-white rounded-xl hover:from-[#6D68A3] hover:to-[#9289BB] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-medium shadow-lg hover:shadow-xl"
              disabled={isSubmitting || uploadingImage}
            >
              {(isSubmitting || uploadingImage) && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              )}
              <span>
                {uploadingImage ? "Uploading Image..." : `${item ? "Update" : "Add"} Service`}
              </span>
              {!isSubmitting && !uploadingImage && (
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

export default ServicesPage;
