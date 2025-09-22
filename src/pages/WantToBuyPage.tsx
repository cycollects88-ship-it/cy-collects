import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface WantToBuyFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cardName: string;
  cardSet: string;
  condition: string;
  maxPrice: number;
  description: string;
}

/**
 * Want to Buy Page
 * Dedicated page for the want-to-buy form
 */
const WantToBuyPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WantToBuyFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    cardName: "",
    cardSet: "",
    condition: "Any",
    maxPrice: 0,
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const conditions = [
    "Any",
    "Mint/Near Mint",
    "Lightly Played",
    "Moderately Played",
    "Heavily Played",
    "Damaged",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - replace with actual submission logic
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }, 2000);
  };

  const handleInputChange = (field: keyof WantToBuyFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit a want-to-buy request and we'll search our network of suppliers and collectors to find the cards you need.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7D78A3] to-[#A29CBB] px-6 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Want to Buy Request</h2>
              <p className="text-white/90">Tell us what cards you're looking for!</p>
            </div>
          </div>

          {/* Success State */}
          {isSubmitted && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Request Submitted!</h3>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for your request. We'll search our network and get back to you soon!
              </p>
              <div className="text-sm text-gray-500">
                Redirecting to home page...
              </div>
            </div>
          )}

          {/* Form */}
          {!isSubmitted && (
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Customer Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-[#7D78A3] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Your Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Card Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-[#7D78A3] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Card Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                      placeholder="e.g., Charizard VMAX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Set/Series
                    </label>
                    <input
                      type="text"
                      value={formData.cardSet}
                      onChange={(e) => handleInputChange("cardSet", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                      placeholder="e.g., Darkness Ablaze"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleInputChange("condition", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                    >
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Price (¥) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={formData.maxPrice || ""}
                      onChange={(e) => handleInputChange("maxPrice", Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                  placeholder="Tell us more about what you're looking for, any specific variants, or other requirements..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#7D78A3] text-white rounded-lg hover:bg-[#A29CBB] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting && (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isSubmitting ? "Submitting..." : "Submit Request"}</span>
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>We'll search our network of suppliers and collectors</li>
                      <li>If we find your card, we'll contact you with details</li>
                      <li>No obligation to purchase - we'll check availability first</li>
                      <li>Typically takes 1-3 business days to respond</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WantToBuyPage;
