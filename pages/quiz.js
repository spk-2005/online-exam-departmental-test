import React, { useEffect, useState, useRef } from "react"; // Import useRef
import { useRouter } from "next/router";
import { Clock, User, CheckCircle, AlertCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";

export default function Quiz() {
  let html2pdf;
if (typeof window !== 'undefined') {
  import('html2pdf.js').then(module => {
    html2pdf = module.default;
  }).catch(error => {
    console.error("Failed to load html2pdf.js:", error);
  });
}
  const router = useRouter();
  const [group, setGroup] = useState("");
  const [test, setTest] = useState("");

  // Use useRef to store the interval ID
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
  const [timer, setTimer] = useState(7200);
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
    if (questions.length === 0) return;

    // Store the interval ID in the ref
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          clearInterval(timerIntervalRef.current); // Clear using the ref
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function to clear interval if component unmounts or questions change
    return () => clearInterval(timerIntervalRef.current);
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

  const handleSubmit = async () => {
    // --- MODIFIED CODE STARTS HERE ---
    // Stop the timer immediately when submit is clicked
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null; // Clear the ref
    }
    // --- MODIFIED CODE ENDS HERE ---

    try {
      let scoreCalc = 0;
      questions.forEach((q, i) => {
        if (selectedOption[i] === q.options[q.correct.charCodeAt(0) - 65]) {
          scoreCalc++;
        }
      });

      setScore(scoreCalc);
      setShowSummary(true);
      setShowSubmitConfirm(false);

      const actualUsername = localStorage.getItem('username') || name;

      console.log("=== SUBMIT DEBUG ===");
      console.log("name state:", name);
      console.log("localStorage userName:", localStorage.getItem('username'));
      console.log("Final username to send:", actualUsername);

      const attemptedCount = Object.values(selectedOption).filter(val => val !== undefined).length;

      const totalTimeInSeconds = 7200;
      const timeElapsedSeconds = totalTimeInSeconds - timer; // Use the timer's value *at the moment of submit click*

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

      console.log("Submitting with username:", resultData.name);

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

  // --- Start of corrected conditional rendering ---
  if (showSummary) {
    // Calculate time elapsed in seconds
    const totalQuizDuration = 7200; // Your initial total quiz time in seconds
    const timeElapsedSeconds = totalQuizDuration - timer;

    // Use a similar formatting logic for display here
    const formatElapsedTimeForDisplay = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      if (minutes > 0) {
        return `${minutes} minutes`;
      } else {
        return `${remainingSeconds} seconds`;
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div id="result-summary" className="bg-white rounded-lg shadow-lg p-8"> {/* Added ID here for html2pdf */}
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
                  {((score / questions.length) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Object.keys(selectedOption).length}
                </div>
                <div className="text-sm text-gray-600">Attempted</div>
              </div>

              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {questions.length - Object.keys(selectedOption).length}
                </div>
                <div className="text-sm text-gray-600">Not Attempted</div>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className={`text-4xl font-bold mb-4 ${
                ((score / questions.length) * 100) >= 40 ? 'text-green-600' : 'text-red-600'
                }`}>
                {((score / questions.length) * 100) >= 40 ? '✅ PASS' : '❌ FAIL'}
              </div>
              <div className="text-lg text-gray-600">
                Time Taken: {formatElapsedTimeForDisplay(timeElapsedSeconds)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Candidate: {name} | Test: {decodeURIComponent(group)} - {decodeURIComponent(test)}
              </div>
            </div>

            <div className="text-center mt-6 space-x-4">
              <button
                onClick={() => {
                  // Ensure html2pdf is loaded. You might need to import it or load it via a script tag.
                  // For example, if you installed it via npm:
                  // import html2pdf from 'html2pdf.js'; // at the top of the file
                  const element = document.getElementById("result-summary");
                   if (html2pdf) { // Check if html2pdf is actually loaded before using it
    html2pdf().from(element).set({
                      margin: 10,
                      filename: `${name}_${decodeURIComponent(group)}_${decodeURIComponent(test)}_Result.pdf`,
                      html2canvas: { scale: 2 },
                      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                    }).save();
                  } else {
                    alert("PDF generation library not loaded. Please ensure html2pdf.js is correctly integrated.");
                    console.error("html2pdf is not defined. Make sure the library is loaded.");
                  }
                }}
                className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition-colors"
              >
                📥 Download Results PDF
              </button>

              <button
                onClick={() => router.push("/")}
                className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // --- End of corrected conditional rendering ---

  if (!group || !test) {
    // This block will now only be hit if group/test are truly missing AND showSummary is false.
    // It's still good to redirect if the necessary quiz info isn't there.
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center text-red-600">
          <p>Quiz information missing. Redirecting...</p>
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
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Submit Confirmation</h2>

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
                  // Optionally, restart timer here if user cancels submission
                  // For simplicity, we are keeping it stopped after the first click.
                  // If you want to restart, you'd need to re-initialize the interval.
                  setShowSubmitConfirm(false);

                  // Re-start the timer if the user cancels submission
                  // if (!timerIntervalRef.current) {
                  //   timerIntervalRef.current = setInterval(() => {
                  //     setTimer(prev => {
                  //       if (prev <= 0) {
                  //         clearInterval(timerIntervalRef.current);
                  //         handleSubmit();
                  //         return 0;
                  //       }
                  //       return prev - 1;
                  //     });
                  //   }, 1000);
                  // }
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                No
              </button>
              <button
                onClick={handleSubmit} // This will re-trigger handleSubmit, but the timer is already stopped
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
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
            onClick={openQuestionPaper}
            className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
          >
            <span className="text-sm">📄 Question Paper</span>
          </button>
          <button
            onClick={openInstructions}
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
          <div className="border-t border-gray-300 p-4 flex justify-between bg-gray-50">
            <div className="flex space-x-2">
              <button
                onClick={markReview}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Mark For Review & Next
              </button>
              <button
                onClick={clearResponse}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Clear Response
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Stop timer when confirmation dialog is shown
                  if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                  }
                  setShowSubmitConfirm(true);
                }}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Submit
              </button>
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-300 transition-transform duration-300 ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}`}>
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