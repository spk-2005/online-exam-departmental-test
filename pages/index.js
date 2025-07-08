import { useEffect, useState } from "react";
import Login from "./login";
import Leaderboard from "./Leaderboard";
import Link from "next/link";
import PaymentRedirect from "./paymentredirect"; // Keep this import

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if localStorage is available (browser environment)
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedUsername = localStorage.getItem("username");
          const isAuth = localStorage.getItem("isAuthenticated");
          const loginTime = localStorage.getItem("loginTime");

          if (storedUsername && isAuth === "true") {
            // Check if session is expired (24 hours)
            const sessionDuration = 24 * 60 * 60 * 1000;
            if (loginTime && Date.now() - parseInt(loginTime) > sessionDuration) {
              // Session expired, clear storage
              clearAuthData();
              setIsAuthenticated(false);
            } else {
              // User is authenticated and session is valid
              setIsAuthenticated(true);
              setUsername(storedUsername);
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearAuthData = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem("username");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("loginTime");
    }
  };

  const handleLogout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    setUsername("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header for authenticated users */}
      {isAuthenticated && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back, {username}!
                </h1>
                <p className="text-gray-600">You are successfully logged in.</p>
              </div>
              <div className="flex space-x-3">
                <Link href="/dashboard">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Section (only if not authenticated) */}
          {!isAuthenticated && (
            <div className="mb-12 lg:col-span-2"> {/* Takes full width on smaller screens */}
              <Login />
            </div>
          )}

          {/* Payment Section - Always visible */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment & Verification
            </h2>
            {/* Pass username to PaymentRedirect if authenticated */}
            <PaymentRedirect username={isAuthenticated ? username : ""} />
          </div>

          {/* Leaderboard Section - Always visible */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Leaderboard
            </h2>
            <Leaderboard />
          </div>
        </div>

        {/* Note about payment (only if not authenticated) */}
        {!isAuthenticated && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-center">
              <strong>Note:</strong> You can submit payment details directly or login to link them to your account.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}