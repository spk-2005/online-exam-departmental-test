import { useEffect, useState } from "react";
import Login from "./login";
import Leaderboard from "./Leaderboard";
import Link from "next/link";
import PaymentRedirect from "./paymentredirect";
import ContactUs from "./components/Contactus";
import IssueReportingForm from "./IssueReportingForm";
import Footer from "./components/footer";

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
      localStorage.removeItem("auth-token");
    }
  };

  const handleLogout = async () => {
    clearAuthData();
    setIsAuthenticated(false);
    setUsername("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="text-center p-6 sm:p-8 md:p-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 max-w-md w-full">
          <div className="relative mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 opacity-30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">డాష్‌బోర్డ్ లోడ్ అవుతోంది (Loading Dashboard)</h2>
          <p className="text-sm sm:text-base text-gray-600">మీ అనుభవాన్ని సిద్ధం చేసే వరకు దయచేసి వేచి ఉండండి (Please wait while we prepare your experience)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 font-sans text-gray-800">
      {/* Header for authenticated users */}
      {isAuthenticated && (
       <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 shadow-xl backdrop-blur-sm border-b border-blue-600/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-1">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    Welcome back, <span className="text-yellow-300 font-extrabold">{username}!</span>
                </h1>
                <p className="mt-1 text-blue-100 text-xs sm:text-sm opacity-90">
                    మీ పరీక్షలను జయించడానికి సిద్ధంగా ఉన్నారా? 🚀 
                </p>
            </div>
            <div className="flex flex-col xs:flex-row items-center gap-3 w-full sm:w-auto">
                <Link href="/dashboard" className="w-full xs:w-auto group">
                    <button className="w-full px-6 py-3 bg-white text-blue-800 hover:bg-gray-100 transition-all duration-300 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95">
                        <span className="flex items-center justify-center gap-2">
                            డాష్‌బోర్డ్ (Dashboard)
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </span>
                    </button>
                </Link>
                {/* Note added next to the Dashboard button */}
                <p className="text-white text-sm mt-2 sm:mt-0 max-w-xs text-center sm:text-left">
                    పరీక్షలను రాసెందుకు dashboard button నొక్కండి
                    <br />
                    
                </p>
                <button
                    onClick={handleLogout}
                    className="w-full xs:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white transition-all duration-300 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                    లాగౌట్ (Logout)
                </button>
            </div>
        </div>
    </div>
</header>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-3">
        {/* Demo Quiz Banner - Modified for less space and added Telugu */}
        <section className="mb-8 lg:mb-12 relative overflow-hidden">
          {/* Reduced padding (p-4 sm:p-6 lg:p-8) from p-6 sm:p-8 lg:p-10 */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-700/90 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left flex-1">
                {/* Reduced heading size (text-xl sm:text-2xl lg:text-3xl) from text-2xl sm:text-3xl lg:text-4xl */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">
                  🚀 Try Our Demo Quiz!                </h2>
                {/* Reduced paragraph size (text-sm sm:text-base) from sm:text-base lg:text-lg */}
                <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                  మా ప్లాట్‌ఫారమ్‌ను ఉచిత <strong className="text-yellow-300">నమూనా క్విజ్‌తో</strong> అనుభవించండి. లాగిన్ అవసరం లేదు! 
                </p>
              </div>
              <Link href='/Samplequiz' passHref>
                <button className="group bg-white text-purple-700 hover:bg-purple-50 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300">
                  <span className="flex items-center gap-2">
                    (Start Demo)
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Login Section (only if not authenticated) */}
        {!isAuthenticated && (
          <div className="mb-8 lg:mb-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">ఖాతా లాగిన్ (Account Login)</h2>
            </div>
            {/* Note added before Login component */}
            <div className="text-center bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl mb-6 shadow-sm">
              <p className="text-sm font-medium">
                login అవ్వాలంటే దయచేసి payment పూర్తి చేయండి. ఆ తర్వాత మా ప్లాట్‌ఫారమ్ ద్వారా మీకు username, password పంపించడం జరుగుతుంది.
                <br />
                (To log in, please complete the payment. After that, your username and password will be sent to you by our platform.)
              </p>
            </div>
            <Login />
          </div>
        )}

        {/* Vertical Layout - Payment, Leaderboard, Issues */}
        <div className="space-y-6 sm:space-y-8">
          {/* Payment Section - First */}
          <div id="payment-section" className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">చెల్లింపు (Payment)</h2>
            </div>
            <PaymentRedirect username={isAuthenticated ? username : ""} />
          </div>

          {/* Leaderboard Section - Second */}
          <div id="leaderboard-section" className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">లీడర్‌బోర్డ్ (Leaderboard)</h2>
            </div>
            <Leaderboard />
          </div>

          {/* Issue Reporting - Third */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">సమస్యలను నివేదించండి (Report Issues)</h2>
            </div>
            <IssueReportingForm />
          </div>
        </div>

      
      </main>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-gray-100 to-gray-200 mt-12 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <ContactUs />
          <Footer/>
        </div>
      </section>
    </div>
  );
}