import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCategoryContext } from "../../contexts/CategoryContext";
import { Category, CategoryInsert, CategoryUpdate } from "../../contexts/CategoryContext";
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
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
 * Categories Management Page
 * Allows admin to view, add, edit, and delete product categories
 */
const CategoriesPage: React.FC = () => {
  const { 
    loading: categoriesLoading, 
    categories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryActive 
  } = useCategoryContext();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<{ isOpen: boolean; message: string; variant: "success" | "error" }>({ isOpen: false, message: "", variant: "success" });

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = (id: string) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      setIsSubmitting(true);
      const success = await deleteCategory(deleteTargetId);
      if (!success) {
        setShowAlert({ isOpen: true, message: "Failed to delete category. Please try again.", variant: "error" });
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

  const handleToggleActive = async (id: string) => {
    setIsSubmitting(true);
    const success = await toggleCategoryActive(id);
    if (!success) {
      setShowAlert({ isOpen: true, message: "Failed to toggle category status. Please try again.", variant: "error" });
    }
    setIsSubmitting(false);
  };

  const handleSaveCategory = async (formData: Partial<CategoryInsert>) => {
    setIsSubmitting(true);
    
    if (editingCategory) {
      // Update existing category
      const success = await updateCategory(editingCategory.id, formData as CategoryUpdate);
      if (success) {
        setShowModal(false);
        // Category will be updated in context automatically
      } else {
        setShowAlert({ isOpen: true, message: "Failed to update category. Please try again.", variant: "error" });
      }
    } else {
      // Add new category
      const success = await createCategory(formData as CategoryInsert);
      if (success) {
        setShowModal(false);
        // Category will be added to context automatically
      } else {
        setShowAlert({ isOpen: true, message: "Failed to create category. Please try again.", variant: "error" });
      }
    }
    
    setIsSubmitting(false);
  };

  const activeCategories = categories.filter(c => c.active !== false).length;

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
              placeholder="Search categories..."
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
          onClick={handleAddCategory}
          className="bg-[#7D78A3] hover:bg-[#A29CBB] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Category</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">{activeCategories}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Categories Grid */}
      {categoriesLoading ? (
        <motion.div 
          className="p-8 text-center"
          variants={itemVariants}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7D78A3] mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading categories...</p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name || "Unnamed Category"}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(category.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7D78A3] focus:ring-offset-2 ${
                        category.active !== false ? "bg-[#7D78A3]" : "bg-gray-200"
                      }`}
                      disabled={isSubmitting}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          category.active !== false ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.active !== false
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {category.active !== false ? "Active" : "Inactive"}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-[#7D78A3] hover:text-[#A29CBB] transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <CategoryModal
            category={editingCategory}
            onSave={handleSaveCategory}
            onClose={() => setShowModal(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category? This action cannot be undone."
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

interface CategoryModalProps {
  category: Category | null;
  onSave: (data: Partial<CategoryInsert>) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onSave, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    active: category?.active ?? true,
  });

  // Reset form data when category changes
  useEffect(() => {
    setFormData({
      name: category?.name || "",
      active: category?.active ?? true,
    });
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {category ? "Edit Category" : "Add New Category"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
              placeholder="e.g., Rare Cards"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-[#7D78A3] focus:ring-[#7D78A3] border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active (visible to customers)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#7D78A3] text-white rounded-lg hover:bg-[#A29CBB] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{category ? "Update" : "Add"} Category</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default CategoriesPage;
