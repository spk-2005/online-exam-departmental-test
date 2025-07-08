// components/AvailableTests.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from '@/styles/AvailableTests.module.css';

export default function AvailableTests() {
  const [attemptsData, setAttemptsData] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Effect to check authentication and set username on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (!storedUsername || isAuthenticated !== "true") {
      router.push("/login");
      return;
    }

    setUsername(storedUsername);
  }, [router]);

  // Effect to fetch test attempts once username is available
  useEffect(() => {
    if (!username) return; // Do not fetch if username is not set yet

    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError("");

        // Re-check authentication before fetching
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (isAuthenticated !== "true") {
          router.push("/login");
          return;
        }

        const res = await fetch(`/api/users/attempts?username=${username}`, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (res.status === 401) {
          // Authentication failed or session expired
          localStorage.removeItem("username");
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("loginTime");
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (res.ok) {
          // Assuming data.groupAttempts is an array like:
          // [{ group: "EOT 141", tests: [{ testName: "Test 1", remainingAttempts: 3 }] }]
          setAttemptsData(data.groupAttempts || []);
        } else {
          setError(data.message || "Failed to fetch test data");
        }
      } catch (error) {
        console.error("Error fetching attempts:", error);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [username, router]); // Re-run when username changes

  const handleStartTest = async (group, testName) => {
    // Frontend check: Only proceed if attempts are remaining
    const groupToUpdate = attemptsData.find(g => g.group === group);
    const testToUpdate = groupToUpdate?.tests.find(t => t.testName === testName);

    if (!testToUpdate || testToUpdate.remainingAttempts <= 0) {
      setError("No attempts left for this test or test not found.");
      return;
    }

    // Directly navigate to the test page if attempts are available
    // The test page (test1.js) or a dedicated API endpoint *from test1.js*
    // should be responsible for decrementing the attempt count *after* the test starts/finishes.
    router.push(`/test1?group=${encodeURIComponent(group)}&test=${encodeURIComponent(testName)}`);
  };

  if (loading) {
    return (
      <div className={styles.availableTestsSection}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading your tests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.availableTestsSection}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <div>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.availableTestsSection}>
      <h2 className={styles.mainHeading}>📝 Available Groups & Tests</h2>
      {attemptsData.length === 0 ? (
        <p className={styles.noTestsMessage}>No available tests.</p>
      ) : (
        attemptsData.map((group, index) => (
          <div key={index} className={styles.testGroup}>
            <h3 className={styles.groupHeading}>📌 {group.group}</h3>
            <ul className={styles.testList}>
              {group.tests.map((test, i) => (
                <li key={i} className={styles.testItem}>
                  <div className={styles.testInfo}>
                    <div className={styles.testName}>{test.testName}</div>
                    <div className={styles.attemptsInfo}>
                      Attempts Left: <span className={styles.attemptsCount}>{test.remainingAttempts}</span>
                    </div>
                  </div>
                  <div className={styles.actionContainer}>
                    {test.remainingAttempts > 0 ? (
                      <button
                        onClick={() => handleStartTest(group.group, test.testName)}
                        className={styles.startTestBtn}
                      >
                        Start Test
                      </button>
                    ) : (
                      <span className={styles.noAttempts}>No attempts left</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}