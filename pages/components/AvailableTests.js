// components/AvailableTests.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4 shadow-sm"></div>
            <div className="text-gray-900 text-xl font-medium">Loading your tests...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="border-2 border-red-500 text-red-700 px-6 py-8 rounded-lg text-center shadow-lg">
            <div className="text-lg font-medium mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-6 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-105"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 transform transition-all duration-500 hover:scale-105">
            📝 Available Tests
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            📚 అందుబాటులో ఉన్న పరీక్షలు
          </h2>
          <p className="text-gray-600 text-lg transition-opacity duration-300">
            Welcome back, <span className="font-semibold text-gray-900">{username}</span>! Choose a test to begin.
          </p>
          <p className="text-gray-600 text-lg mt-2">
            <span className="font-semibold text-gray-900">{username}</span> గారు, తిరిగి స్వాగతం! పరీక్షను ఎంచుకోండి.
          </p>
        </div>

        {/* No Tests Message */}
        {attemptsData.length === 0 ? (
          <div className="border-2 border-gray-300 rounded-lg p-8 text-center shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="text-gray-900 text-xl font-medium">No available tests at the moment.</div>
            <div className="text-gray-900 text-lg font-medium mt-2">ప్రస్తుతం ఎలాంటి పరీక్షలు అందుబాటులో లేవు.</div>
            <p className="text-gray-600 mt-2">Check back later for new assignments.</p>
            <p className="text-gray-600">కొత్త పరీక్షల కోసం తర్వాత చూడండి.</p>
          </div>
        ) : (
          /* Test Groups */
          <div className="space-y-8">
            {attemptsData.map((group, index) => (
              <div key={index} className="border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-102">
                {/* Group Header */}
                <div className="border-b-2 border-gray-300 px-6 py-4 transition-all duration-300 hover:bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3 transition-transform duration-300 hover:scale-110">📌</span>
                    {group.group}
                  </h2>
                </div>

                {/* Tests List */}
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {group.tests.map((test, i) => (
                      <div key={i} className="border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-all duration-300 hover:shadow-lg transform hover:scale-105 hover:-translate-y-1">
                        {/* Test Name */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 transition-colors duration-300">
                            {test.testName}
                          </h3>
                          
                          {/* Attempts Info */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-600">Attempts Left:</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 transition-all duration-300 ${
                              test.remainingAttempts > 0 
                                ? 'border-green-500 text-green-700 shadow-sm' 
                                : 'border-red-500 text-red-700 shadow-sm'
                            }`}>
                              {test.remainingAttempts}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">మిగిలిన అవకాశాలు:</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 transition-all duration-300 ${
                              test.remainingAttempts > 0 
                                ? 'border-green-500 text-green-700 shadow-sm' 
                                : 'border-red-500 text-red-700 shadow-sm'
                            }`}>
                              {test.remainingAttempts}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-6">
                          {test.remainingAttempts > 0 ? (
                            <button
                              onClick={() => handleStartTest(group.group, test.testName)}
                              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
                            >
                              Start Test (పరీక్ష ప్రారంభించండి)
                            </button>
                          ) : (
                            <div className="w-full border-2 border-gray-400 text-gray-500 font-medium py-3 px-4 rounded-lg text-center transition-all duration-300 shadow-sm">
                              No attempts left (అవకాశాలు లేవు)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}