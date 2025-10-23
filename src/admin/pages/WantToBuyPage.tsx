import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useWantToBuyContext, WantToBuy } from "../../contexts/WantToBuyContext";
import { supabaseAdmin } from "../../utils/supabase-client";
import ConfirmDialog from "../../components/ConfirmDialog";

/**
 * Extended WantToBuy type with user information
 */
interface WantToBuyWithUser extends WantToBuy {
  user_email?: string;
  user_display_name?: string;
  user_phone?: string;
}

/**
 * Card Requests Management Page
 * Allows admin to view and manage customer card requests
 */
const WantToBuyPage: React.FC = () => {
  const { wantToBuyItems, updateWantToBuy, deleteWantToBuy, loading } = useWantToBuyContext();
  const [itemsWithUsers, setItemsWithUsers] = useState<WantToBuyWithUser[]>([]);
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRequest, setEditingRequest] = useState<WantToBuyWithUser | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [doneFilter, setDoneFilter] = useState<string>("all");
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  /**
   * Fetch user information for all card request items
   */
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (wantToBuyItems.length === 0) {
        setItemsWithUsers([]);
        return;
      }

      try {
        // Get unique user IDs
        const userIdsSet = new Set<string>();
        for (const item of wantToBuyItems) {
          if (item.user_id) {
            userIdsSet.add(item.user_id);
          }
        }
        const userIds = Array.from(userIdsSet);
        
        if (userIds.length === 0) {
          setItemsWithUsers(wantToBuyItems);
          return;
        }

        // Fetch auth users data using the admin API with service role key
        // This requires the service role key which bypasses RLS
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) {
          console.error("Error fetching users:", usersError);
        }

        // Create a map of user_id to user info (including phone from user_metadata)
        const usersMap = new Map(
          users?.map(user => [
            user.id,
            {
              email: user.email || "",
              display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "",
              phone: user.user_metadata?.phone_number || ""
            }
          ]) || []
        );

        // Combine the data
        const itemsWithUserInfo: WantToBuyWithUser[] = wantToBuyItems.map(item => {
          const userInfo = usersMap.get(item.user_id || "");
          
          return {
            ...item,
            user_email: userInfo?.email || "Unknown User",
            user_display_name: userInfo?.display_name || "Unknown",
            user_phone: userInfo?.phone || "N/A"
          };
        });

        setItemsWithUsers(itemsWithUserInfo);
      } catch (error) {
        console.error("Error fetching user info:", error);
        // Fallback to showing user IDs
        const itemsWithUserInfo: WantToBuyWithUser[] = wantToBuyItems.map(item => ({
          ...item,
          user_email: item.user_id || "Unknown User",
          user_display_name: "N/A",
          user_phone: "N/A"
        }));
        setItemsWithUsers(itemsWithUserInfo);
      }
    };

    fetchUserInfo();
  }, [wantToBuyItems]);

  const filteredRequests = itemsWithUsers.filter(request => {
    const matchesSearch = request.card_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         request.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         false;
    const matchesDone = doneFilter === "all" || 
                        (doneFilter === "pending" && !request.done) ||
                        (doneFilter === "done" && request.done);
    return matchesSearch && matchesDone;
  });

  const handleEditRequest = (request: WantToBuyWithUser) => {
    setEditingRequest(request);
    setShowModal(true);
  };

  const handleUpdateDone = async (id: string, done: boolean) => {
    await updateWantToBuy(id, { done });
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deleteWantToBuy(deleteTargetId);
      setShowConfirmDelete(false);
      setDeleteTargetId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setDeleteTargetId(null);
  };

  const handleSaveRequest = async (formData: { done: boolean }) => {
    if (editingRequest) {
      await updateWantToBuy(editingRequest.id, formData);
    }
    setShowModal(false);
  };

  const totalRequests = wantToBuyItems.length;
  const pendingRequests = wantToBuyItems.filter(r => !r.done).length;
  const completedRequests = wantToBuyItems.filter(r => r.done).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D78A3]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by card, name, email, or phone..."
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
            value={doneFilter}
            onChange={(e) => setDoneFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedRequests}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Card Requests ({filteredRequests.length})
          </h3>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No card requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#7D78A3] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {request.user_display_name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {request.user_display_name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500 max-w-[200px] truncate">
                            {request.user_email || "No email"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {request.user_phone || "No phone"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.card_name || "No card name"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.media_url ? (
                        <img
                          src={request.media_url}
                          alt={request.card_name || "Card"}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.condition || "Not specified"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleUpdateDone(request.id, !request.done)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.done
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.done ? "Done" : "Pending"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditRequest(request)}
                        className="text-[#7D78A3] hover:text-[#A29CBB] transition-colors duration-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Request Details Modal */}
      {showModal && editingRequest && (
        <RequestModal
          request={editingRequest}
          onSave={handleSaveRequest}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Request?"
        message="Are you sure you want to delete this card request? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

interface RequestModalProps {
  request: WantToBuyWithUser;
  onSave: (data: { done: boolean }) => void;
  onClose: () => void;
}

/**
 * Modal component for viewing and editing card request details
 */
const RequestModal: React.FC<RequestModalProps> = ({ request, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    done: request.done || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return createPortal(
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Request Details - {request.card_name}
          </h3>
        </div>

        <div className="p-6">
          {/* Request Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Request Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {request.user_display_name || "Unknown"}</div>
                <div><span className="font-medium">Email:</span> {request.user_email || "Unknown"}</div>
                <div><span className="font-medium">Phone:</span> {request.user_phone || "N/A"}</div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-medium">Card Name:</span> {request.card_name || "Not specified"}
                </div>
                <div><span className="font-medium">Condition:</span> {request.condition || "Not specified"}</div>
                <div><span className="font-medium">Submitted:</span> {new Date(request.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Card Image</h4>
              {request.media_url ? (
                <img
                  src={request.media_url}
                  alt={request.card_name || "Card"}
                  className="w-full h-48 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-select"
                value={formData.done ? "done" : "pending"}
                onChange={(e) => setFormData({ ...formData, done: e.target.value === "done" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#7D78A3] text-white rounded-lg hover:bg-[#A29CBB] transition-colors duration-200"
              >
                Update Request
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default WantToBuyPage;
