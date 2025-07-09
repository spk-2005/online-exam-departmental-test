import { useEffect, useState } from "react";
import Login from "./login"; // Assuming this is your login form component
import Leaderboard from "./Leaderboard"; // Your leaderboard component
import Link from "next/link";
import PaymentRedirect from "./paymentredirect"; // Your payment component
import ContactUs from "./components/Contactus";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedUsername = localStorage.getItem("username");
          const isAuth = localStorage.getItem("isAuthenticated");
          const loginTime = localStorage.getItem("loginTime");

          if (storedUsername && isAuth === "true") {
            const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (loginTime && Date.now() - parseInt(loginTime) > sessionDuration) {
              clearAuthData(); // Session expired
              setIsAuthenticated(false);
            } else {
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
      localStorage.removeItem("auth-token"); // Ensure token is cleared on logout
    }
  };

  const handleLogout = async () => { // Changed to async to match Dashboard's logout
    // Removed setIsLoggingOut, as it's not declared in Home.js
    clearAuthData();
    setIsAuthenticated(false);
    setUsername("");
    // Optionally, redirect after local state clear
    // router.push("/"); // Uncomment if you want to redirect immediately
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-xl transform transition-transform duration-500 hover:scale-105">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
          <p className="text-xl sm:text-2xl font-semibold text-gray-700">Loading your dashboard...</p>
          <p className="text-sm sm:text-base text-gray-500 mt-2">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 antialiased">
      {/* Header for authenticated users */}
      {isAuthenticated && (
        <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-xl py-4 sm:py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white text-shadow-lg"> {/* Added text-shadow-lg */}
                Welcome back, <span className="text-yellow-300 drop-shadow-md">{username}!</span>
              </h1>
              <p className="mt-1 text-blue-100 text-sm sm:text-base opacity-90 text-shadow-sm"> {/* Changed to text-blue-100, added text-shadow-sm */}
                Ready to conquer your exams?
              </p>
            </div>
            <div className="flex flex-col xs:flex-row items-center space-y-3 xs:space-y-0 xs:space-x-4 w-full sm:w-auto">
              <Link href="/dashboard" className="w-full xs:w-auto px-5 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors duration-300 rounded-lg text-base sm:text-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-center">
  Dashboard
</Link><button
                onClick={handleLogout}
                className="w-full xs:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 transition-colors duration-300 rounded-lg text-base sm:text-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-center"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Sample Demo Quiz Link - Optimized for minimum space */}
        <section className="mb-10 p-4 sm:p-5 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl shadow-lg border border-purple-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4 transform transition-transform duration-300 hover:scale-[1.01]">
          <div className="flex-1 min-w-0"> {/* Flex-1 to take available space, min-w-0 for responsiveness */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-purple-800 mb-2 sm:mb-0">
              🚀 Try Our Demo Quiz!
            </h2>
            <p className="text-sm sm:text-base text-purple-700 max-w-2xl mx-auto leading-relaxed hidden sm:block"> {/* Hidden on small screens */}
              Experience our platform with a **free sample quiz**. No login required!
            </p>
          </div>
          <Link href='/Samplequiz' passHref>
            <button className="flex-shrink-0 inline-flex items-center justify-center px-5 sm:px-6 py-2 sm:py-2.5 border border-transparent text-sm sm:text-base font-bold rounded-full shadow-md text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              Start Demo
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </Link>
        </section>

        {/* Grid for Login/Payment/Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Login Section (only if not authenticated) */}
          {!isAuthenticated && (
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-800 mb-5 border-b pb-3 border-blue-200 flex items-center justify-center sm:justify-start">
                🔒 Account Login
              </h2>
              <Login />
            </div>
          )}

          {/* Payment Section */}
          <div id="payment-section" className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-5 border-b pb-3 border-blue-200 flex items-center justify-center sm:justify-start">
              💳 Payment & Verification
            </h2>
            <PaymentRedirect username={isAuthenticated ? username : ""} />
          </div>

          {/* Leaderboard Section */}
          <div id="leaderboard-section" className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-green-100">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-green-700 mb-5 border-b pb-3 border-green-200 flex items-center justify-center sm:justify-start">
              🏆 Leaderboard
            </h2>
            <Leaderboard />
          </div>
        </div>

        {/* Note about payment (only if not authenticated) */}
        {!isAuthenticated && (
          <div className="mt-10 p-5 sm:p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl border border-teal-200 shadow-xl transform transition-transform duration-300 hover:scale-[1.01]">
            <p className="text-teal-800 text-sm sm:text-lg text-center leading-relaxed">
              **Heads up:** You can submit payment details directly or <strong className="text-teal-900">log in</strong> to link them seamlessly to your account and track your progress!
            </p>
          </div>
        )}
      </main>
      <div className="mt-12"> {/* Added margin top to separate from main content */}
        <ContactUs />
      </div>
    </div>
  );
}