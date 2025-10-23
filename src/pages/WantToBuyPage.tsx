import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWantToBuyContext } from "../contexts/WantToBuyContext";
import { useAuthContext } from "../contexts/AuthContext";
import { supabase } from "../utils/supabase-client";

interface WantToBuyFormData {
  cardName: string;
  condition: string;
  mediaFile: File | null;
}

/**
 * Card Request Page
 * Dedicated page for submitting card requests
 * Requires authentication to submit
 */
const WantToBuyPage: React.FC = () => {
  const navigate = useNavigate();
  const { addWantToBuy } = useWantToBuyContext();
  const { user } = useAuthContext();
  
  const [formData, setFormData] = useState<WantToBuyFormData>({
    cardName: "",
    condition: "Any",
    mediaFile: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showProfilePrompt, setShowProfilePrompt] = useState<boolean>(false);

  const conditions = [
    "Any",
    "Mint/Near Mint",
    "Lightly Played",
    "Moderately Played",
    "Heavily Played",
    "Damaged",
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, mediaFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `want-to-buy/${fileName}`;

      // Upload with upsert option to handle permissions
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        // Try with public upload if regular upload fails
        const { error: publicUploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true
          });
        
        if (publicUploadError) {
          console.error("Error uploading image with upsert:", publicUploadError);
          return null;
        }
      }

      const { data } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Exception uploading image:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to submit a card request.");
      return;
    }

    // Check if user has filled in their profile (display name and phone number)
    const displayName = user.user_metadata?.display_name?.trim();
    const phoneNumber = user.user_metadata?.phone_number?.trim();

    console.log("WantToBuy - User metadata:", user.user_metadata);
    console.log("WantToBuy - Display name:", displayName);
    console.log("WantToBuy - Phone number:", phoneNumber);

    if (!displayName || !phoneNumber) {
      console.log("WantToBuy - Missing profile info, showing prompt");
      setShowProfilePrompt(true);
      return;
    }

    console.log("WantToBuy - Profile complete, proceeding with submission");

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload image if provided
      let mediaUrl: string | null = null;
      if (formData.mediaFile) {
        mediaUrl = await uploadImage(formData.mediaFile);
      }

      // Submit to database
      const success = await addWantToBuy({
        card_name: formData.cardName,
        condition: formData.condition,
        media_url: mediaUrl,
        done: false,
      });

      if (success) {
        setIsSubmitted(true);
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError("Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting card request:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof WantToBuyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show profile completion prompt if user hasn't filled name/phone
  if (showProfilePrompt) {
    return (
      <div className="py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
            <p className="text-gray-600 mb-6">
              To submit a card request, we need your <strong>display name</strong> and <strong>phone number</strong>. 
              This helps us contact you when we find your card!
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-left">
              <p className="text-sm text-yellow-800">
                <strong>Missing:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
                {!user?.user_metadata?.display_name && <li>Display Name</li>}
                {!user?.user_metadata?.phone_number && <li>Phone Number</li>}
              </ul>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowProfilePrompt(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="flex-1 px-4 py-2 bg-[#7D78A3] text-white rounded-lg hover:bg-[#A29CBB] transition-colors duration-200"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#7D78A3] to-[#A29CBB] px-6 py-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Request a Card</h2>
                <p className="text-white/90">Login required to submit a request</p>
              </div>
            </div>
            
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to submit a card request. This helps us prevent spam and allows us to contact you about your request.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Go Back
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 bg-[#7D78A3] text-white rounded-lg hover:bg-[#A29CBB] transition-colors duration-200"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit a card request and we'll search our network of suppliers and collectors to find the cards you need.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7D78A3] to-[#A29CBB] px-6 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Request a Card</h2>
              <p className="text-white/90">Tell us what card you're looking for!</p>
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
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Card Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-[#7D78A3] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Card Details
                </h3>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Card Name *
                    </label>
                    <input
                      id="card-name"
                      type="text"
                      required
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                      placeholder="e.g., Charizard VMAX Rainbow Rare"
                    />
                  </div>

                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Condition
                    </label>
                    <select
                      id="condition"
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
                    <label htmlFor="card-image" className="block text-sm font-medium text-gray-700 mb-2">
                      Card Image (Optional)
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Upload a reference image to help us identify the exact card you're looking for
                    </p>
                    <input
                      id="card-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
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
