import React, { useState, useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useUserDetailsContext } from "../contexts/UserDetailsContext";
import { supabase } from "../utils/supabase-client";
import { motion } from "framer-motion";

/**
 * Profile Page component
 * Allows users to view and edit their profile information
 */
const ProfilePage: React.FC = () => {
  const { user, updatePassword } = useAuthContext();
  const { userDetails } = useUserDetailsContext();
  
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.user_metadata?.display_name) {
      setDisplayName(user.user_metadata.display_name);
    }
    if (user?.user_metadata?.phone_number) {
      setPhoneNumber(user.user_metadata.phone_number);
    }
  }, [user]);

  /**
   * Handle profile update (display name and phone number)
   */
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      setIsUpdatingProfile(true);
      
      // Prepare metadata updates object
      const metadataUpdates: { display_name?: string, phone_number?: string } = {};
      
      // Add display name to updates if changed
      if (displayName !== user?.user_metadata?.display_name) {
        metadataUpdates.display_name = displayName;
      }
      
      // Add phone to metadata if changed (stored in user_metadata to avoid SMS verification requirement)
      if (phoneNumber !== user?.user_metadata?.phone_number) {
        metadataUpdates.phone_number = phoneNumber;
      }

      // Update user metadata in auth
      if (Object.keys(metadataUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser({
          data: metadataUpdates
        });
        if (error) {
          console.error("Error updating profile:", error);
          setErrorMessage(error.message || "Failed to update profile");
          return;
        }
      }

      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      setErrorMessage("An error occurred while updating profile");
      console.error("Profile update exception:", error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setIsChangingPassword(true);
      const { error } = await updatePassword(newPassword);

      if (error) {
        setErrorMessage(error.message || "Failed to update password");
      } else {
        setSuccessMessage("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setErrorMessage("An error occurred while updating password");
      console.error(error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Profile Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
              {/* Display Name (Editable) */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email address cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              {/* Phone Number (Editable) */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                />
              </div>

              {/* Role (Read-only) */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={userDetails?.role || "customer"}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed capitalize"
                />
              </div>

              {/* Account Created Date */}
              <div>
                <label htmlFor="created" className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  id="created"
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }) : "N/A"}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Update Profile Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2 bg-[#7D78A3] text-white rounded-lg hover:bg-[#A29CBB] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                    placeholder="Enter your current password"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Note: For security, we don't verify your current password when changing it.
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                    placeholder="Enter your new password"
                  />
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D78A3] focus:border-transparent"
                    placeholder="Confirm your new password"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-6 py-2 bg-[#7D78A3] text-white rounded-lg hover:bg-[#A29CBB] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Stats Card */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Account Statistics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#7D78A3]">0</div>
                  <div className="text-sm text-gray-600 mt-1">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#7D78A3]">0</div>
                  <div className="text-sm text-gray-600 mt-1">Want-to-Buy Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#7D78A3]">0</div>
                  <div className="text-sm text-gray-600 mt-1">Services Used</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;

