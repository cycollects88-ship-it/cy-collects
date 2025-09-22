import React, { useState } from "react";
import { createPortal } from "react-dom";

interface WantToBuyRequest {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cardName: string;
  cardSet: string;
  condition: string;
  maxPrice: number;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "contacted" | "found" | "closed";
  submittedAt: string;
  notes: string;
}

/**
 * Want-to-Buy Requests Management Page
 * Allows admin to view and manage customer want-to-buy requests
 */
const WantToBuyPage: React.FC = () => {
  const [requests, setRequests] = useState<WantToBuyRequest[]>([
    {
      id: 1,
      customerName: "John Smith",
      customerEmail: "john.smith@email.com",
      customerPhone: "+1 (555) 123-4567",
      cardName: "Charizard VMAX Rainbow Rare",
      cardSet: "Darkness Ablaze",
      condition: "Mint/Near Mint",
      maxPrice: 25000,
      description: "Looking for the rainbow rare Charizard VMAX from Darkness Ablaze. Must be in perfect condition for my collection.",
      priority: "high",
      status: "pending",
      submittedAt: "2024-01-20",
      notes: "",
    },
    {
      id: 2,
      customerName: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      customerPhone: "+1 (555) 987-6543",
      cardName: "Pikachu Illustrator Promo",
      cardSet: "Promo",
      condition: "Any",
      maxPrice: 500000,
      description: "Seeking the legendary Pikachu Illustrator promo card. Condition not important as long as it's authentic.",
      priority: "high",
      status: "contacted",
      submittedAt: "2024-01-18",
      notes: "Customer contacted, searching through network",
    },
    {
      id: 3,
      customerName: "Mike Chen",
      customerEmail: "mike.chen@email.com",
      customerPhone: "+1 (555) 456-7890",
      cardName: "Eevee Heroes Complete Set",
      cardSet: "Eevee Heroes",
      condition: "Near Mint",
      maxPrice: 15000,
      description: "Need the complete Eevee Heroes set. Willing to buy individually or as a lot.",
      priority: "medium",
      status: "found",
      submittedAt: "2024-01-15",
      notes: "Found complete set, waiting for customer response",
    },
    {
      id: 4,
      customerName: "Emma Wilson",
      customerEmail: "emma.w@email.com",
      customerPhone: "+1 (555) 321-0987",
      cardName: "Base Set Shadowless Blastoise",
      cardSet: "Base Set",
      condition: "Played",
      maxPrice: 8000,
      description: "Looking for a played condition Base Set shadowless Blastoise for my deck.",
      priority: "low",
      status: "closed",
      submittedAt: "2024-01-10",
      notes: "Customer found card elsewhere",
    },
  ]);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRequest, setEditingRequest] = useState<WantToBuyRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const statuses = ["All", "Pending", "Contacted", "Found", "Closed"];
  const priorities = ["All", "Low", "Medium", "High"];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.cardSet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEditRequest = (request: WantToBuyRequest) => {
    setEditingRequest(request);
    setShowModal(true);
  };

  const handleUpdateStatus = (id: number, newStatus: "pending" | "contacted" | "found" | "closed") => {
    setRequests(requests.map(request =>
      request.id === id
        ? { ...request, status: newStatus }
        : request
    ));
  };

  const handleUpdatePriority = (id: number, newPriority: "low" | "medium" | "high") => {
    setRequests(requests.map(request =>
      request.id === id
        ? { ...request, priority: newPriority }
        : request
    ));
  };

  const handleSaveRequest = (formData: Partial<WantToBuyRequest>) => {
    if (editingRequest) {
      setRequests(requests.map(request =>
        request.id === editingRequest.id
          ? { ...request, ...formData }
          : request
      ));
    }
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "found":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  const highPriorityRequests = requests.filter(r => r.priority === "high").length;
  const totalValue = requests.reduce((sum, request) => sum + request.maxPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search requests..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statuses.slice(1).map(status => (
              <option key={status} value={status.toLowerCase()}>{status}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
          >
            <option value="all">All Priority</option>
            {priorities.slice(1).map(priority => (
              <option key={priority} value={priority.toLowerCase()}>{priority}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.178 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{highPriorityRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                BND ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Want-to-Buy Requests ({filteredRequests.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.cardName}</div>
                      <div className="text-sm text-gray-500">{request.cardSet}</div>
                      <div className="text-sm text-gray-500">Condition: {request.condition}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.customerName}</div>
                    <div className="text-sm text-gray-500">{request.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    BND ${request.maxPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={request.priority}
                      onChange={(e) => handleUpdatePriority(request.id, e.target.value as "low" | "medium" | "high")}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-[#7D78A3] ${getPriorityColor(request.priority)}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={request.status}
                      onChange={(e) => handleUpdateStatus(request.id, e.target.value as "pending" | "contacted" | "found" | "closed")}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-[#7D78A3] ${getStatusColor(request.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="found">Found</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditRequest(request)}
                      className="text-[#7D78A3] hover:text-[#A29CBB] transition-colors duration-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => window.open(`mailto:${request.customerEmail}`, "_blank")}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    >
                      Email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {showModal && editingRequest && (
        <RequestModal
          request={editingRequest}
          onSave={handleSaveRequest}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

interface RequestModalProps {
  request: WantToBuyRequest;
  onSave: (data: Partial<WantToBuyRequest>) => void;
  onClose: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ request, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    status: request.status,
    priority: request.priority,
    notes: request.notes,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return createPortal(
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Request Details - {request.cardName}
          </h3>
        </div>

        <div className="p-6">
          {/* Request Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Card Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Card Name:</span> {request.cardName}</div>
                <div><span className="font-medium">Set:</span> {request.cardSet}</div>
                <div><span className="font-medium">Condition:</span> {request.condition}</div>
                <div><span className="font-medium">Max Price:</span> BND ${request.maxPrice.toLocaleString()}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {request.customerName}</div>
                <div><span className="font-medium">Email:</span> {request.customerEmail}</div>
                <div><span className="font-medium">Phone:</span> {request.customerPhone}</div>
                <div><span className="font-medium">Submitted:</span> {new Date(request.submittedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Description</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {request.description}
            </p>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "pending" | "contacted" | "found" | "closed" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="found">Found</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                placeholder="Add notes about this request..."
              />
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
                type="button"
                onClick={() => window.open(`mailto:${request.customerEmail}?subject=Regarding your want-to-buy request: ${request.cardName}`, "_blank")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Email Customer
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
      </div>
    </div>,
    document.body
  );
};

export default WantToBuyPage;
