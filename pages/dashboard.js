// pages/dashboard.js - Enhanced responsive version
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AvailableTests from "./components/AvailableTests";
import PaymentRedirect from "./paymentredirect";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUsername = localStorage.getItem("username");
        const isAuth = localStorage.getItem("isAuthenticated");
        const loginTime = localStorage.getItem("loginTime");

        if (!storedUsername || !isAuth || isAuth !== "true") {
          router.push("/");
          return;
        }

        // Check if session is expired (24 hours)
        const sessionDuration = 24 * 60 * 60 * 1000;
        if (loginTime && Date.now() - parseInt(loginTime) > sessionDuration) {
          localStorage.removeItem("username");
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("loginTime");
          router.push("/login");
          return;
        }

        setUsername(storedUsername);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("username");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("loginTime");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("username");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("auth-token");
      router.push("/");
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <div style={styles.loadingText}>Loading...</div>
    </div>
  );

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.welcomeText}>Welcome back, {username}!</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              ...styles.logoutButton,
              ...(isLoggingOut ? styles.logoutButtonDisabled : {})
            }}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <AvailableTests />
          <PaymentRedirect />
        </div>
      </main>
    </div>
  );
}

// Styles object for better organization
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    gap: '16px',
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e3e3e3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  loadingText: {
    fontSize: '18px',
    color: '#6c757d',
    fontWeight: '500',
  },
  
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #dee2e6',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    flexWrap: 'wrap',
    gap: '16px',
  },
  
  welcomeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#212529',
    margin: 0,
  },
  
  welcomeText: {
    fontSize: '16px',
    color: '#6c757d',
    margin: 0,
    fontWeight: '400',
  },
  
  logoutButton: {
    padding: '12px 24px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minWidth: '120px',
  },
  
  logoutButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },
  
  main: {
    padding: '24px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
};

// Add CSS keyframes for spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .dashboard-header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .dashboard-title {
        font-size: 24px !important;
        background-color:black;
        
      }
      
      .dashboard-logout-button {
        width: 100%;
        text-align: center;
      }
    }
    
    @media (max-width: 480px) {
      .dashboard-main {
        padding: 16px !important;
      }
      
      .dashboard-header-content {
        padding: 16px !important;
      }
      
      .dashboard-title {
        font-size: 22px !important;
      }
    }
  `;
  
  // Only add if not already present
  if (!document.head.querySelector('#dashboard-styles')) {
    style.id = 'dashboard-styles';
    document.head.appendChild(style);
  }
}

// Add responsive classes to elements
export const DashboardStyles = {
  headerContent: 'dashboard-header-content',
  title: 'dashboard-title',
  logoutButton: 'dashboard-logout-button',
  main: 'dashboard-main',
};