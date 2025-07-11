import React, { useEffect, useState, useRef } from "react";

import { Clock, User, CheckCircle, AlertCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";
export default function Quiz() {

  useEffect(() => {
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "";  // Modern browsers ignore custom messages but this prevents reload
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);




  const router = useRouter();
   useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();

      const confirmLeave = window.confirm(
        "If you go back, you'll lose your attempt. Are you sure you want to leave?"
      );

      if (confirmLeave) {
        router.push("/"); // or your custom page
      } else {
        // pushState again to prevent navigation
        history.pushState(null, null, location.href);
      }
    };

    history.pushState(null, null, location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [router]);

  const [group, setGroup] = useState("");
  const [test, setTest] = useState("");

  const timerIntervalRef = useRef(null);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes.toString().padStart(2, '0')} mins`;
    } else {
      return `${secs.toString().padStart(2, '0')} secs`;
    }
  };

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedGroup = localStorage.getItem("quizGroup");
      const storedTest = localStorage.getItem("quizTest");

      if (storedGroup && storedTest) {
        setGroup(storedGroup);
        setTest(storedTest);
      } else {
        router.push("/");
      }
    }
  }, [router]);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [status, setStatus] = useState({});
  const [timer, setTimer] = useState(7200); // 2 hours in seconds
  const [showSummary, setShowSummary] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('Test User');
  const [isClient, setIsClient] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [questionPaperOpen, setQuestionPaperOpen] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      const queryName = router.query.name;

      if (storedUsername) {
        setName(storedUsername);
      } else if (queryName) {
        setName(queryName);
      } else {
        setName('Test User');
      }
    }
  }, [router.query.name, router.isReady]);

  useEffect(() => {
    if (router.isReady && group && test) {
      fetchQuestions();
    }
  }, [router.isReady, group, test]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const decodedGroup = decodeURIComponent(group);
      const decodedTest = decodeURIComponent(test);

      const res = await fetch(`/api/tests/gettests?group=${encodeURIComponent(decodedGroup)}&test=${encodeURIComponent(decodedTest)}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch questions: ${errorData.message || res.statusText}`);
      }

      const data = await res.json();

      if (!data || data.length === 0) {
        throw new Error('No questions found for this test');
      }

      setQuestions(data);
      // Initialize status for all questions as 'not-visited'
      const initialStatus = {};
      data.forEach((_, i) => {
        initialStatus[i] = 'not-visited';
      });
      setStatus(initialStatus);

      setError(null);


              await decreaseAttempts();

    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(`Failed to load questions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
const decreaseAttempts = async () => {
  try {
    const username = localStorage.getItem("username");
    if (!username) return;

    const res = await fetch("/api/decrease", {  // ensure correct route here
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        group: decodeURIComponent(group),
        testName: decodeURIComponent(test)
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to decrease attempts:", errorText);
    } else {
      const data = await res.json();
      console.log("Attempts decreased:", data);
    }
  } catch (err) {
    console.error("Error decreasing attempts:", err);
  }
};


  useEffect(() => {
    if (questions.length === 0) return;

    // Only start timer if it's not already running and not on summary page
    if (!timerIntervalRef.current && !showSummary) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 0) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            handleSubmit(); // Auto-submit when timer reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [questions.length, showSummary]); // Add showSummary to dependency array to prevent timer restart after submission
useEffect(() => {
  if (!showSummary) return;

  const handlePopState = (e) => {
    e.preventDefault();
    router.replace("/");
  };

  window.history.pushState(null, null, window.location.href);
  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [showSummary, router]);


  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only prompt if quiz is active and not showing summary
      if (questions.length > 0 && !showSummary) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [questions.length, showSummary]);

  const handleOptionChange = (val) => {
    setSelectedOption(prev => ({ ...prev, [index]: val }));
    // If the question was marked for review without an answer, and now answered, update status
    setStatus(prev => ({ ...prev, [index]: markedQuestions[index] ? "answered-marked" : "answered" }));
  };

  const nextQuestion = () => {
    // Only update status if it's not already 'answered-marked'
    if (status[index] !== "answered-marked" && selectedOption[index] && status[index] !== "answered") {
      setStatus(prev => ({ ...prev, [index]: "answered" }));
    } else if (!selectedOption[index] && status[index] === "not-visited") {
      setStatus(prev => ({ ...prev, [index]: "not-answered" }));
    }
    if (index < questions.length - 1) setIndex(index + 1);
  };

  const prevQuestion = () => {
    if (index > 0) setIndex(index - 1);
  };

  const markReview = () => {
    setMarkedQuestions(prev => ({ ...prev, [index]: true }));
    // If an option is selected, it's answered-marked, otherwise just review
    setStatus(prev => ({ ...prev, [index]: selectedOption[index] ? "answered-marked" : "review" }));
    if (index < questions.length - 1) setIndex(index + 1);
  };

  const clearResponse = () => {
    setSelectedOption(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    // Set status based on whether it was marked for review or not
    setStatus(prev => ({ ...prev, [index]: markedQuestions[index] ? "review" : "not-answered" }));
  };

  const goToQuestion = (questionIndex) => {
    // Before navigating, update the status of the current question if not already handled
    if (status[index] === 'not-visited') {
      setStatus(prev => ({ ...prev, [index]: "not-answered" }));
    } else if (selectedOption[index] && status[index] !== "answered-marked" && status[index] !== "answered") {
      // If an option is selected and it's not already set to answered/answered-marked, set it
      setStatus(prev => ({ ...prev, [index]: markedQuestions[index] ? "answered-marked" : "answered" }));
    } else if (!selectedOption[index] && status[index] !== "review" && status[index] !== "not-answered") {
      // If no option is selected and it's not already set to review/not-answered, set it
      setStatus(prev => ({ ...prev, [index]: markedQuestions[index] ? "review" : "not-answered" }));
    }
    setIndex(questionIndex);
  };

const handleSubmit = async () => {
  // Stop the timer immediately when submit is clicked
  if (timerIntervalRef.current) {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
  }

  try {
    let scoreCalc = 0;
    let attemptedCount = 0;

    questions.forEach((q, i) => {
      if (selectedOption[i] !== undefined) { // Check if an option was truly selected for this question
        attemptedCount++;
        if (selectedOption[i] === q.options[q.correct.charCodeAt(0) - 65]) {
          scoreCalc++;
        }
      }
    });

    setScore(scoreCalc);
    setShowSummary(true);
    setShowSubmitConfirm(false);

    const actualUsername = localStorage.getItem('username') || name;

    const totalTimeInSeconds = 7200;
    const timeElapsedSeconds = totalTimeInSeconds - timer; // This correctly calculates time spent

    const hoursTaken = Math.floor(timeElapsedSeconds / 3600);
    const minutesTaken = Math.floor((timeElapsedSeconds % 3600) / 60);
    const secondsTaken = timeElapsedSeconds % 60;
    const formattedTimeTaken = `${hoursTaken.toString().padStart(2, '0')}:${minutesTaken.toString().padStart(2, '0')}:${secondsTaken.toString().padStart(2, '0')}`;

    const resultData = {
      name: actualUsername,
      group: decodeURIComponent(group),
      test: decodeURIComponent(test),
      score: scoreCalc,
      attempted: attemptedCount,
      unattempted: questions.length - attemptedCount,
      total: questions.length,
      percentage: ((scoreCalc / questions.length) * 100).toFixed(2),
      finalresult: ((scoreCalc / questions.length) * 100) >= 40 ? "PASS" : "FAIL",
      timeTaken: formattedTimeTaken,
      submittedAt: new Date().toISOString()
    };

    const submitRes = await fetch("/api/results/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultData)
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      console.error('Failed to submit results:', errorText);
    } else {
      const responseData = await submitRes.json();
      console.log('Submit response:', responseData);
      
      if (responseData.success) {
        console.log('✅ Results successfully saved');
      } else {
        console.log('❌ Results were NOT saved');
        console.log('Reason:', responseData.error || 'Unknown');
      }
    }
  } catch (err) {
    console.error('Error submitting results:', err);
  }
};

  const getQuestionStats = () => {
    // Corrected logic for status counts
    const answered = Object.keys(status).filter(i => status[i] === 'answered').length;
    const review = Object.keys(status).filter(i => status[i] === 'review').length;
    const notAnswered = Object.keys(status).filter(i => status[i] === 'not-answered').length;
    const answeredMarked = Object.keys(status).filter(i => status[i] === 'answered-marked').length;
    const notVisited = questions.length - (answered + review + notAnswered + answeredMarked);

    return { answered, review, notAnswered, notVisited, answeredMarked };
  };

  const getQuestionStatusClass = (questionIndex) => {
    const questionStatus = status[questionIndex];

    switch (questionStatus) {
      case "answered":
        return "bg-green-500 text-white";
      case "answered-marked":
        return "bg-purple-500 text-white border-2 border-purple-700";
      case "review":
        return "bg-yellow-500 text-white";
      case "not-answered":
        return "bg-red-500 text-white";
      case "not-visited":
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const openQuestionPaper = () => {
    if (questionPaperOpen) {
      alert('Question paper is already open.');
      return;
    }
    setQuestionPaperOpen(true);
    const questionsJson = encodeURIComponent(JSON.stringify(questions));
    const newWindow = window.open(`/question/${questionsJson}`, '_blank', 'noopener,noreferrer,width=800,height=600');

    if (newWindow) {
      newWindow.onbeforeunload = () => {
        setQuestionPaperOpen(false);
      };
    }
  };

  const openInstructions = () => {
    if (instructionOpen) {
      alert('Instructions are already open.');
      return;
    }
    setInstructionOpen(true);
    const newWindow = window.open(`/instruction2/${name}`, '_blank', 'noopener,noreferrer,width=800,height=600');

    if (newWindow) {
      newWindow.onbeforeunload = () => {
        setInstructionOpen(false);
      };
    }
  };

  if (!isClient || !router.isReady) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const totalQuizDuration = 7200;
    const timeElapsedSeconds = totalQuizDuration - timer;

    const formatElapsedTimeForDisplay = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      let result = [];
      if (hours > 0) result.push(`${hours} hour${hours > 1 ? 's' : ''}`);
      if (minutes > 0) result.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
      if (remainingSeconds > 0 || result.length === 0) result.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);

      return result.join(' ');
    };

    const handleDownloadPdf = () => {
      // Data to send to the server for PDF generation
      const params = new URLSearchParams({
        name: encodeURIComponent(name),
        group: encodeURIComponent(group),
        test: encodeURIComponent(test),
        score: score,
        total: questions.length,
        timeTaken: formatElapsedTimeForDisplay(timeElapsedSeconds),
        percentage: ((score / questions.length) * 100).toFixed(1),
        result: ((score / questions.length) * 100) >= 40 ? 'PASS' : 'FAIL',
        attempted: getQuestionStats().answered + getQuestionStats().answeredMarked, // Correctly pass attempted count
        notAttempted: getQuestionStats().notAnswered + getQuestionStats().notVisited + getQuestionStats().review // Correctly pass not attempted count
      }).toString();

      // Directly open the API route in a new tab to trigger download
      try {
        window.open(`/api/generate-pdf?${params}`, '_blank');
      } catch (error) {
        console.error("Error initiating PDF download:", error);
        alert("Failed to download PDF. Please try again.");
      }
    };


    return (
      <div className="min-h-screen bg-gray-100 py-6 sm:py-12 flex items-center justify-center">
        <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-4xl w-full mx-auto px-2 sm:px-4">
          <div id="result-summary" className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 text-gray-800">
              📊 Quiz Results
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="text-center p-3 sm:p-6 bg-blue-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{score}</div>
                <div className="text-xs sm:text-sm text-gray-600">Correct Answers</div>
              </div>

              <div className="text-center p-3 sm:p-6 bg-green-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                  {((score / questions.length) * 100).toFixed(1)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Percentage</div>
              </div>

              <div className="text-center p-3 sm:p-6 bg-purple-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
                  {getQuestionStats().answered + getQuestionStats().answeredMarked}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Attempted</div>
              </div>

              <div className="text-center p-3 sm:p-6 bg-orange-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
                  {questions.length - (getQuestionStats().answered + getQuestionStats().answeredMarked)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Not Attempted</div>
              </div>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <div className={`text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 ${
                ((score / questions.length) * 100) >= 40 ? 'text-green-600' : 'text-red-600'
                }`}>
                {((score / questions.length) * 100) >= 40 ? '✅ PASS' : '❌ FAIL'}
              </div>
              <div className="text-base sm:text-lg text-gray-600">
                Time Taken: {formatElapsedTimeForDisplay(timeElapsedSeconds)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                Candidate: {name} | Test: {decodeURIComponent(group)} - {decodeURIComponent(test)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-6 space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleDownloadPdf}
                className="bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                📥 Download Results PDF
              </button>

              <button
                onClick={() => router.replace("/")}
                className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!group || !test) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center text-red-600 p-4">
          <p className="text-lg">Quiz information missing. Redirecting to home...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-4">
          <div className="text-red-500 text-5xl sm:text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4 text-base sm:text-lg">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={fetchQuestions}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm sm:text-base"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSubmitConfirm) {
    const stats = getQuestionStats();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-sm sm:max-w-xl md:max-w-2xl w-full mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Submit Confirmation</h2>

          <div className="overflow-x-auto mb-4 sm:mb-6 text-xs sm:text-sm">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 sm:p-3 text-left">Section</th>
                  <th className="border border-gray-300 p-2 sm:p-3 text-center">Total</th>
                  <th className="border border-gray-300 p-2 sm:p-3 text-center">Ans.</th>
                  <th className="border border-gray-300 p-2 sm:p-3 text-center">Not Ans.</th>
                  <th className="border border-gray-300 p-2 sm:p-3 text-center">Rev.</th>
                  <th className="border border-gray-300 p-2 sm:p-3 text-center">Ans. & Rev.</th>
                  <th className="border border-gray-300 p-2 sm:p-3 text-center">Not Visited</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 sm:p-3 font-semibold">
                    {decodeURIComponent(group)} {decodeURIComponent(test)}
                  </td>
                  <td className="border border-gray-300 p-2 sm:p-3 text-center">{questions.length}</td>
                  <td className="border border-gray-300 p-2 sm:p-3 text-center">{stats.answered}</td>
                  <td className="border border-gray-300 p-2 sm:p-3 text-center">{stats.notAnswered}</td>
                  <td className="border border-gray-300 p-2 sm:p-3 text-center">{stats.review}</td>
                  <td className="border border-gray-300 p-2 sm:p-3 text-center">{stats.answeredMarked}</td>
                  <td className="border border-gray-300 p-2 sm:p-3 text-center">{stats.notVisited}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <p className="text-base sm:text-lg mb-4 sm:mb-6">Are you sure you want to submit?</p>
            <div className="flex justify-center space-x-3 sm:space-x-4">
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  // Optionally re-start timer if user cancels submission
                  if (!timerIntervalRef.current && timer > 0 && !showSummary) {
                    timerIntervalRef.current = setInterval(() => {
                      setTimer(prev => {
                        if (prev <= 0) {
                          clearInterval(timerIntervalRef.current);
                          timerIntervalRef.current = null;
                          handleSubmit();
                          return 0;
                        }
                        return prev - 1;
                      });
                    }, 1000);
                  }
                }}
                className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-600 text-sm sm:text-base"
              >
                No
              </button>
              <button
                onClick={handleSubmit}
                className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-600 text-sm sm:text-base"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getQuestionStats();
  const displayText = `${decodeURIComponent(group)} ${decodeURIComponent(test)}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col select-none">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center">
          <span className="text-yellow-400 font-bold text-base sm:text-lg">
            {displayText}
          </span>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6 flex-wrap justify-end">
          <button
            className="flex items-center space-x-1 sm:space-x-2 hover:text-yellow-400 transition-colors text-xs sm:text-sm px-2 py-1 rounded"
          >
            📄 <span className="hidden sm:inline">Question Paper</span><span className="sm:hidden">Paper</span>
          </button>
          <button
            className="flex items-center space-x-1 sm:space-x-2 hover:text-yellow-400 transition-colors text-xs sm:text-sm px-2 py-1 rounded"
          >
            👁 <span className="hidden sm:inline">View Instructions</span><span className="sm:hidden">Instructions</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className={`flex-1 bg-white transition-all duration-300 overflow-y-auto ${showRightPanel ? 'sm:mr-80' : 'mr-0'}`}>
          {/* Test Header */}
          <div className="bg-blue-500 text-white p-3 flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 px-2 py-1 rounded text-xs sm:text-sm font-semibold">
                {displayText}
              </span>
            </div>
            <div className="text-right text-sm">
              <span>Time Remaining: </span>
              <span className="font-bold text-red-200">{formatTime(timer)}</span>
            </div>
          </div>

          {/* Question Type */}
          <div className="border-b border-gray-300 p-3 text-sm">
            <span className="font-semibold">Question Type: MCQ</span>
          </div>

          {/* Question Number */}
          <div className="border-b border-gray-300 p-3">
            <span className="text-base sm:text-lg font-semibold">Question No. {index + 1}</span>
          </div>

          {/* Question Content */}
          <div className="p-4 sm:p-6 min-h-[300px] sm:min-h-96">
            {questions.length > 0 && (
              <>
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4 sm:mb-6 leading-relaxed">
                    {questions[index].question}
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    {questions[index].options.map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-start space-x-3 cursor-pointer p-2 sm:p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all"
                      >
                        <input
                          type="radio"
                          value={opt}
                          checked={selectedOption[index] === opt}
                          onChange={() => handleOptionChange(opt)}
                          className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-800 leading-relaxed">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-300 p-3 sm:p-4 flex flex-col sm:flex-row justify-between bg-gray-50 gap-3">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={markReview}
                className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Mark For Review & Next
              </button>
              <button
                onClick={clearResponse}
                className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Clear Response
              </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              <button
                onClick={() => {
                  if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                  }
                  setShowSubmitConfirm(true);
                }}
                className="px-4 py-1.5 text-xs sm:px-6 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Submit
              </button>
              <button
                onClick={nextQuestion}
                className="px-4 py-1.5 text-xs sm:px-6 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={`fixed right-0 top-0 h-full w-64 sm:w-80 bg-white border-l border-gray-300 transition-transform duration-300 z-40 ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Toggle Button */}
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1.5 sm:p-2 rounded-l hover:bg-blue-600 transition-colors z-50"
          >
            {showRightPanel ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="h-full overflow-y-auto">
            {/* User Info */}
            <div className="p-3 sm:p-4 border-b border-gray-300 flex items-center space-x-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-gray-800">Candidate</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">{name}</div>
              </div>
            </div>

            {/* Status Legend */}
            <div className="p-3 sm:p-4 border-b border-gray-300">
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded text-center leading-5 sm:leading-6 font-semibold text-gray-700">
                    {stats.notVisited}
                  </div>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded text-center leading-5 sm:leading-6 font-semibold">
                    {stats.notAnswered}
                  </div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded text-center leading-5 sm:leading-6 font-semibold">
                    {stats.answered}
                  </div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white rounded text-center leading-5 sm:leading-6 font-semibold">
                    {stats.review}
                  </div>
                  <span>Marked For Review</span>
                </div>
              </div>
              <div className="mt-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 text-white rounded text-center leading-5 sm:leading-6 font-semibold">
                    {stats.answeredMarked}
                  </div>
                  <span>Answered & Marked</span>
                </div>
              </div>
            </div>

            {/* Question Navigator */}
            <div className="p-3 sm:p-4">
              <div className="bg-blue-500 text-white p-2 text-center font-semibold rounded-t text-sm sm:text-base">
                {displayText}
              </div>
              <div className="bg-blue-300 text-white p-2 text-center font-semibold text-sm sm:text-base">
                Choose Question
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-b max-h-64 overflow-y-auto">
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToQuestion(i)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-xs sm:text-sm font-semibold transition-all flex items-center justify-center ${
                        i === index
                          ? 'bg-blue-500 text-white border-2 border-blue-700 scale-110'
                          : getQuestionStatusClass(i)
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}