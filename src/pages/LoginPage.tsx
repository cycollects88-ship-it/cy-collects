import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

/**
 * Login Page Component
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const { signIn, resendConfirmationEmail } = useAuthContext();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/";
  const successMessage = location.state?.message as string | undefined;

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const { error } = await resendConfirmationEmail(email);
      
      if (error) {
        setError(`Failed to resend confirmation email: ${error.message}`);
      } else {
        setResendSuccess(true);
        setError(null);
        setShowResendButton(false);
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError("Failed to resend confirmation email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Handle specific error cases
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setError("Please verify your email address before signing in. Check your inbox for the confirmation link.");
          setShowResendButton(true);
        } else if (error.message.toLowerCase().includes("invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
          setShowResendButton(false);
        } else {
          setError(error.message);
          setShowResendButton(false);
        }
        setLoading(false);
      } else {
        // Login successful - use globalThis.location to force a full page reload
        // This ensures the auth state is properly loaded from localStorage
        setLoading(false);
        globalThis.location.href = from;
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="bg-[#7D78A3]/10 border border-[#7D78A3]/30 text-[#7D78A3] px-4 py-3 rounded-md flex items-start space-x-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Check your email!</p>
                <p className="text-sm mt-1">{successMessage}</p>
              </div>
            </div>
          )}
          
          {resendSuccess && (
            <div className="bg-[#7D78A3]/10 border border-[#7D78A3]/30 text-[#7D78A3] px-4 py-3 rounded-md flex items-start space-x-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Confirmation email sent!</p>
                <p className="text-sm mt-1">Please check your inbox and click the confirmation link to activate your account.</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              <p>{error}</p>
              {showResendButton && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading}
                  className="mt-3 text-sm font-medium text-[#7D78A3] hover:text-[#6a6692] underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Sending..." : "Resend confirmation email"}
                </button>
              )}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/reset-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
