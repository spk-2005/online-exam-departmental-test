import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Clock, User, CheckCircle, AlertCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";

export default function Quiz() {
  const router = useRouter();
  const [group, setGroup] = useState("");
  const [test, setTest] = useState("");

  // Use useRef to store the interval ID and track start time
  const timerIntervalRef = useRef(null);
  const quizStartTimeRef = useRef(null);
  const quizEndTimeRef = useRef(null);

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

  // Format elapsed time for display (more readable format)
  const formatElapsedTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  };

  // Format time for submission (HH:MM:SS format)
  const formatTimeForSubmission = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  const [showInstructions, setShowInstructions] = useState(false);
  const [questionPaperOpen, setQuestionPaperOpen] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);

  // Track actual time taken
  const [actualTimeTaken, setActualTimeTaken] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      const queryName = router.query.name;

      console.log("=== USERNAME RESOLUTION ===");
      console.log("localStorage username:", storedUsername);
      console.log("router.query.name:", queryName);

      if (storedUsername) {
        console.log("Using username from localStorage:", storedUsername);
        setName(storedUsername);
      } else if (queryName) {
        console.log("Using username from query:", queryName);
        setName(queryName);
      } else {
        console.log("No username found, using fallback: Test User");
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
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(`Failed to load questions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  // Prevent back navigation when quiz is active
  const handlePopState = (event) => {
    if (questions.length > 0 && !showSummary) {
      event.preventDefault();
      const confirmLeave = window.confirm(
        "Are you sure you want to leave the quiz? Your progress will be lost."
      );
      if (confirmLeave) {
        // Clear localStorage and redirect
        localStorage.removeItem("quizGroup");
        localStorage.removeItem("quizTest");
        router.push('/dashboard');
      } else {
        // Push the current state back to prevent navigation
        window.history.pushState(null, null, window.location.pathname);
      }
    }
  };

  // Add event listener for browser back button
  window.addEventListener('popstate', handlePopState);
  
  // Push initial state to prevent back navigation
  window.history.pushState(null, null, window.location.pathname);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}, [questions.length, showSummary, router]);

const handleBackToHome = async () => {
  try {
    // Clear ALL quiz-related data from localStorage
    localStorage.removeItem("quizGroup");
    localStorage.removeItem("quizTest");
    localStorage.removeItem("Group");
    localStorage.removeItem("Test");
    
    // Clear tab tracking
    const currentTabKey = `quiz_tab_${group}_${test}`;
    localStorage.removeItem(currentTabKey);
    
    // Clear timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Optional: Mark test as completed/attempted in backend
    const userData = {
      name: localStorage.getItem('username') || name,
      group: decodeURIComponent(group),
      test: decodeURIComponent(test),
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    // Send completion status to backend (optional)
    
    // Clear browser history to prevent back navigation
    window.history.replaceState(null, null, '/dashboard');
    
    // Redirect to dashboard
    router.replace('/dashboard'); // Use replace instead of push
  } catch (error) {
    console.error('Error during back to home:', error);
    // Fallback: still clear localStorage and redirect
    localStorage.removeItem("quizGroup");
    localStorage.removeItem("quizTest");
    localStorage.removeItem("Group");
    localStorage.removeItem("Test");
    
    // Clear tab tracking
    const currentTabKey = `quiz_tab_${group}_${test}`;
    localStorage.removeItem(currentTabKey);
    
    window.history.replaceState(null, null, '/dashboard');
    router.replace('/dashboard');
  }
};
  useEffect(() => {
    if (questions.length === 0) return;

    // Set quiz start time when questions are loaded
    quizStartTimeRef.current = Date.now();

    // Store the interval ID in the ref
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          clearInterval(timerIntervalRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function to clear interval if component unmounts or questions change
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [questions.length]);

  // Prevent page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleOptionChange = (val) => {
    setSelectedOption(prev => ({ ...prev, [index]: val }));
    setStatus(prev => ({ ...prev, [index]: "answered" }));
  };

  const nextQuestion = () => {
    setStatus(prev => ({ ...prev, [index]: selectedOption[index] ? "answered" : "not-answered" }));
    if (index < questions.length - 1) setIndex(index + 1);
  };

  const prevQuestion = () => {
    if (index > 0) setIndex(index - 1);
  };

  const markReview = () => {
    setMarkedQuestions(prev => ({ ...prev, [index]: true }));
    setStatus(prev => ({ ...prev, [index]: selectedOption[index] ? "answered-marked" : "review" }));
    if (index < questions.length - 1) setIndex(index + 1);
  };

  const clearResponse = () => {
    setSelectedOption(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setStatus(prev => ({ ...prev, [index]: markedQuestions[index] ? "review" : "not-answered" }));
  };

  const goToQuestion = (questionIndex) => {
    setStatus(prev => ({ ...prev, [index]: selectedOption[index] ? "answered" : "not-answered" }));
    setIndex(questionIndex);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, questionIndex) => {
      const selectedAnswer = selectedOption[questionIndex];
      if (selectedAnswer && question.correct) {
        // Get the correct answer based on the correct property
        const correctAnswerIndex = question.correct.charCodeAt(0) - 65; // Convert 'A', 'B', 'C', 'D' to 0, 1, 2, 3
        const correctAnswer = question.options[correctAnswerIndex];
        
        if (selectedAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    });
    return correctAnswers;
  };

  const getQuestionStatistics = () => {
    const attempted = Object.keys(selectedOption).filter(key => selectedOption[key] !== undefined).length;
    const unattempted = questions.length - attempted;
    const marked = Object.keys(markedQuestions).filter(key => markedQuestions[key]).length;
    
    return {
      attempted,
      unattempted,
      marked,
      total: questions.length
    };
  };

  const calculateTimeTaken = () => {
    if (quizStartTimeRef.current) {
      const endTime = quizEndTimeRef.current || Date.now();
      const timeTakenMs = endTime - quizStartTimeRef.current;
      return Math.floor(timeTakenMs / 1000); // Convert to seconds
    }
    // Fallback to timer-based calculation
    return 7200 - timer;
  };

  const handleSubmit = async () => {
    try {
      // Stop the timer immediately when submit is clicked
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Record end time
      quizEndTimeRef.current = Date.now();

      // Calculate accurate time taken
      const timeTakenSeconds = calculateTimeTaken();
      setActualTimeTaken(timeTakenSeconds);

      // Calculate score
      const calculatedScore = calculateScore();
      setScore(calculatedScore);

      // Get question statistics
      const stats = getQuestionStatistics();

      // Calculate percentage
      const percentage = questions.length > 0 ? ((calculatedScore / questions.length) * 100) : 0;

      // Determine pass/fail (assuming 40% is passing)
      const passingPercentage = 40;
      const finalResult = percentage >= passingPercentage ? "PASS" : "FAIL";

      // Get username
      const actualUsername = localStorage.getItem('username') || name;

      console.log("=== SUBMIT CALCULATIONS ===");
      console.log("Questions total:", questions.length);
      console.log("Attempted:", stats.attempted);
      console.log("Unattempted:", stats.unattempted);
      console.log("Correct answers:", calculatedScore);
      console.log("Percentage:", percentage.toFixed(2));
      console.log("Time taken (seconds):", timeTakenSeconds);
      console.log("Final result:", finalResult);

      // Prepare result data
      const resultData = {
        name: actualUsername,
        group: decodeURIComponent(group),
        test: decodeURIComponent(test),
        score: calculatedScore,
        attempted: stats.attempted,
        unattempted: stats.unattempted,
        total: questions.length,
        percentage: percentage.toFixed(2),
        finalresult: finalResult,
        timeTaken: formatTimeForSubmission(timeTakenSeconds),
        submittedAt: new Date().toISOString(),
        // Additional metadata
        startTime: new Date(quizStartTimeRef.current).toISOString(),
        endTime: new Date(quizEndTimeRef.current).toISOString(),
        timeTakenSeconds: timeTakenSeconds
      };

      console.log("=== SUBMISSION DATA ===");
      console.log("Result data:", resultData);

      // Show summary first
      setShowSummary(true);
      setShowSubmitConfirm(false);

      // Submit to API
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

        if (responseData.attemptsDecreased) {
          console.log('✅ Attempts successfully decreased');
          console.log('Remaining attempts:', responseData.remainingAttempts);
        } else {
          console.log('❌ Attempts were NOT decreased');
          console.log('Reason:', responseData.error || 'Unknown');
        }
      }
    } catch (err) {
      console.error('Error submitting results:', err);
    }
  };

  const getQuestionStats = () => {
    const answered = Object.values(status).filter(s => s === 'answered' || s === 'answered-marked').length;
    const review = Object.values(status).filter(s => s === 'review').length;
    const notAnswered = Object.values(status).filter(s => s === 'not-answered').length;
    const answeredMarked = Object.values(status).filter(s => s === 'answered-marked').length;
    const notVisited = questions.length - answered - review - notAnswered;

    return { answered: answered - answeredMarked, review, notAnswered, notVisited, answeredMarked };
  };

  const getQuestionStatusClass = (questionIndex) => {
    const questionStatus = status[questionIndex];
    const hasAnswer = selectedOption[questionIndex] !== undefined;
    const isMarked = markedQuestions[questionIndex];

    if (questionStatus === "answered" && !isMarked) {
      return "bg-green-500 text-white";
    } else if (questionStatus === "answered-marked" || (hasAnswer && isMarked)) {
      return "bg-purple-500 text-white border-2 border-purple-700";
    } else if (questionStatus === "review" || isMarked) {
      return "bg-yellow-500 text-white";
    } else if (questionStatus === "not-answered") {
      return "bg-red-500 text-white";
    }
    return "bg-gray-300 text-gray-700";
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

  if (!group || !test) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
  <button
    onClick={handleBackToHome}
    className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold"
  >
    Back to Dashboard
  </button>
</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={fetchQuestions}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
            <button
              onClick={handleBackToHome}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const timeTakenForDisplay = actualTimeTaken > 0 ? actualTimeTaken : calculateTimeTaken();
    const percentage = questions.length > 0 ? ((score / questions.length) * 100) : 0;
    const stats = getQuestionStatistics();

    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              📊 Quiz Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{score}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.attempted}
                </div>
                <div className="text-sm text-gray-600">Attempted</div>
              </div>

              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.unattempted}
                </div>
                <div className="text-sm text-gray-600">Not Attempted</div>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className={`text-4xl font-bold mb-4 ${
                percentage >= 40 ? 'text-green-600' : 'text-red-600'
                }`}>
                {percentage >= 40 ? '✅ PASS' : '❌ FAIL'}
              </div>
              <div className="text-lg text-gray-600">
                Time Taken: {formatElapsedTime(timeTakenForDisplay)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Formatted Time: {formatTimeForSubmission(timeTakenForDisplay)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Candidate: {name} | Test: {decodeURIComponent(group)} - {decodeURIComponent(test)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Detailed Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Questions:</span> {questions.length}
                </div>
                <div>
                  <span className="font-medium">Correct:</span> {score}
                </div>
                <div>
                  <span className="font-medium">Incorrect:</span> {stats.attempted - score}
                </div>
                <div>
                  <span className="font-medium">Marked for Review:</span> {stats.marked}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleBackToHome}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSubmitConfirm) {
    const stats = getQuestionStats();
    const timeTakenSoFar = calculateTimeTaken();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Submit Confirmation</h2>

          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Time Information</h3>
            <p className="text-sm text-gray-700">
              Time taken so far: {formatElapsedTime(timeTakenSoFar)} 
              <span className="text-gray-500 ml-2">({formatTimeForSubmission(timeTakenSoFar)})</span>
            </p>
            <p className="text-sm text-gray-700">
              Time remaining: {formatTime(timer)}
            </p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Section Name</th>
                  <th className="border border-gray-300 p-3 text-center">Total Questions</th>
                  <th className="border border-gray-300 p-3 text-center">Answered</th>
                  <th className="border border-gray-300 p-3 text-center">Not Answered</th>
                  <th className="border border-gray-300 p-3 text-center">Marked for Review</th>
                  <th className="border border-gray-300 p-3 text-center">Answered & Marked</th>
                  <th className="border border-gray-300 p-3 text-center">Not Visited</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 font-semibold">
                    {decodeURIComponent(group)} {decodeURIComponent(test)}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">{questions.length}</td>
                  <td className="border border-gray-300 p-3 text-center">{stats.answered}</td>
                  <td className="border border-gray-300 p-3 text-center">{stats.notAnswered}</td>
                  <td className="border border-gray-300 p-3 text-center">{stats.review}</td>
                  <td className="border border-gray-300 p-3 text-center">{stats.answeredMarked}</td>
                  <td className="border border-gray-300 p-3 text-center">{stats.notVisited}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <p className="text-lg mb-6">Are you sure you want to submit?</p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  // Restart timer if user cancels
                  if (questions.length > 0) {
                    timerIntervalRef.current = setInterval(() => {
                      setTimer(prev => {
                        if (prev <= 0) {
                          clearInterval(timerIntervalRef.current);
                          handleSubmit();
                          return 0;
                        }
                        return prev - 1;
                      });
                    }, 1000);
                  }
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                No, Continue Quiz
              </button>
              <button
                onClick={handleSubmit}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              >
                Yes, Submit Final Answer
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
    <div className="min-h-screen bg-gray-100 select-none">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-yellow-400 font-bold text-lg">
            {displayText}
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <button
            className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
          >
            <span className="text-sm">📄 Question Paper</span>
          </button>
          <button
            className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
          >
            <span className="text-sm">👁 View Instructions</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 bg-white transition-all duration-300 ${showRightPanel ? 'mr-80' : 'mr-0'}`}>
          {/* Test Header */}
          <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 px-3 py-1 rounded text-sm font-semibold">
                {displayText}
              </span>
              <span className="bg-blue-600 px-2 py-1 rounded text-xs">1</span>
            </div>
            <div className="text-right">
              <span className="text-sm">Time Remaining: </span>
              <span className="font-bold text-red-200">{formatTime(timer)}</span>
            </div>
          </div>

          {/* Sections */}
          <div className="border-b border-gray-300 p-2">
            <span className="text-sm font-semibold">Sections</span>
          </div>

          <div className="bg-blue-500 text-white p-2 flex items-center space-x-2">
            <span className="bg-blue-600 px-3 py-1 rounded text-sm font-semibold">
              {displayText}
            </span>
            <span className="bg-blue-600 px-2 py-1 rounded text-xs">1</span>
          </div>

          {/* Question Type */}
          <div className="border-b border-gray-300 p-3">
            <span className="text-sm font-semibold">Question Type: MCQ</span>
          </div>

          {/* Question Number */}
          <div className="border-b border-gray-300 p-3">
            <span className="text-lg font-semibold">Question No. {index + 1}</span>
          </div>

          {/* Question Content */}
          <div className="p-6 min-h-96">
            {questions.length > 0 && (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
                    {questions[index].question}
                  </h3>

                  <div className="space-y-4">
                    {questions[index].options.map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-start space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all"
                      >
                        <input
                          type="radio"
                          value={opt}
                          checked={selectedOption[index] === opt}
                          onChange={() => handleOptionChange(opt)}
                          className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0"
                        />
                        <span className="text-gray-800 leading-relaxed">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
      <div className="border-t border-gray-300 p-4 bg-gray-50">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button
                onClick={markReview}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
                Mark For Review & Next
            </button>
            <button
                onClick={clearResponse}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
                Clear Response
            </button>
        </div>
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button
                onClick={() => {
                    // Stop timer when confirmation dialog is shown
                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                    }
                    setShowSubmitConfirm(true);
                }}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-full sm:w-auto"
            >
                Submit
            </button>
            <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full sm:w-auto"
            >
                Save & Next
            </button>
        </div>
    </div>
</div>
        </div>

        {/* Right Panel */}
        <div
  className={`fixed right-0 top-0 h-full bg-white border-l border-gray-300 transition-transform duration-300 z-50
    ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}
    w-full sm:w-80`}
>
  {/* Toggle Button */}
  <button
    onClick={() => setShowRightPanel(!showRightPanel)}
    className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-l hover:bg-blue-600 transition-colors"
  >
    {showRightPanel ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
  </button>

  <div className="h-full overflow-y-auto">
    {/* User Info */}
    <div className="p-4 border-b border-gray-300 flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
        <User className="w-8 h-8 text-gray-600" />
      </div>
      <div>
        <div className="font-semibold text-gray-800">S</div>
        <div className="text-sm text-gray-600">{name}</div>
      </div>
    </div>

    {/* Status Legend */}
    <div className="p-4 border-b border-gray-300">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded text-center leading-6 font-semibold text-gray-700">
            {stats.notVisited}
          </div>
          <span>Not Visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-500 text-white rounded text-center leading-6 font-semibold">
            {stats.notAnswered}
          </div>
          <span>Not Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 text-white rounded text-center leading-6 font-semibold">
            {stats.answered}
          </div>
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-yellow-500 text-white rounded text-center leading-6 font-semibold">
            {stats.review}
          </div>
          <span>Marked For Review</span>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-purple-500 text-white rounded text-center leading-6 font-semibold">
            {stats.answeredMarked}
          </div>
          <span>Answered But Marked For Review</span>
        </div>
      </div>
    </div>

    {/* Question Navigator */}
    <div className="p-4">
      <div className="bg-blue-500 text-white p-2 text-center font-semibold rounded-t">
        {displayText}
      </div>
      <div className="bg-blue-300 text-white p-2 text-center font-semibold">
        Choose Question
      </div>
      <div className="bg-gray-50 p-4 rounded-b max-h-64 overflow-y-auto">
        <div className="grid grid-cols-7 gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => goToQuestion(i)}
              className={`w-8 h-8 rounded text-sm font-semibold transition-all ${
                i === index
                  ? 'border-2 border-blue-600 bg-blue-100 text-blue-800'
                  : getQuestionStatusClass(i)
              } hover:scale-105`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="p-4 border-t border-gray-300">
      <div className="flex space-x-2">
        <button
          onClick={prevQuestion}
          disabled={index === 0}
          className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
            index === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Previous
        </button>
        <button
          onClick={nextQuestion}
          disabled={index === questions.length - 1}
          className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
            index === questions.length - 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Next
        </button>
      </div>
    </div>

    {/* Timer Display */}
    <div className="p-4 border-t border-gray-300">
      <div className="flex items-center space-x-2 text-red-600">
        <Clock size={20} />
        <span className="font-semibold">Time Left: {formatTime(timer)}</span>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}