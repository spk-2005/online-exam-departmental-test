import React, { useEffect, useState, useRef } from "react";
import { Clock, User, CheckCircle, AlertCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";
import ResponseSheet from "./Responsesheet";

export default function Quiz() {
  const router = useRouter();
  
  const [questions, setQuestions] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  // Generate unique attempt ID when component mounts
  const [attemptId] = useState(() => `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [attemptStartTime] = useState(() => new Date().toISOString());
  
  // Add state for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  // Simple refresh prevention for results page only
  useEffect(() => {
    if (!showSummary) return;

    let redirected = false;

    // Prevent refresh shortcuts only
    const preventRefreshShortcuts = (e) => {
      if (redirected) return;

      // F5 (refresh)
      if (e.keyCode === 116) {
        e.preventDefault();
        e.stopPropagation();
        redirected = true;
        alert("Page refresh is disabled on results page. Redirecting to home...");
        window.location.replace("/");
        return false;
      }
      
      // Ctrl+R (refresh)
      if (e.ctrlKey && e.keyCode === 82) {
        e.preventDefault();
        e.stopPropagation();
        redirected = true;
        alert("Page refresh is disabled on results page. Redirecting to home...");
        window.location.replace("/");
        return false;
      }
      
      // Ctrl+F5 (hard refresh)
      if (e.ctrlKey && e.keyCode === 116) {
        e.preventDefault();
        e.stopPropagation();
        redirected = true;
        alert("Page refresh is disabled on results page. Redirecting to home...");
        window.location.replace("/");
        return false;
      }
    };

    // Prevent refresh via beforeunload
    const preventRefresh = (e) => {
      if (redirected) return;
      
      e.preventDefault();
      e.returnValue = "";
      
      // Redirect to home after preventing refresh
      setTimeout(() => {
        if (!redirected) {
          redirected = true;
          window.location.replace("/");
        }
      }, 100);
      
      return "";
    };

    // Add event listeners for refresh prevention only
    document.addEventListener("keydown", preventRefreshShortcuts, { capture: true });
    window.addEventListener("beforeunload", preventRefresh, { capture: true });

    // Cleanup function
    return () => {
      redirected = true;
      document.removeEventListener("keydown", preventRefreshShortcuts, { capture: true });
      window.removeEventListener("beforeunload", preventRefresh, { capture: true });
    };
  }, [showSummary]);

  // Original beforeunload for quiz in progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning during active quiz, not on results page
      if (questions.length > 0 && !showSummary && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "Your quiz progress will be lost if you leave this page.";
        return "Your quiz progress will be lost if you leave this page.";
      }
    };

    // Only add this listener when NOT on results page
    if (!showSummary) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [questions.length, showSummary, isSubmitting]);

  // Back button handling during quiz (not results)
  useEffect(() => {
    if (showSummary) return; // Don't handle back button on results page

    const handleBackButton = (event) => {
      event.preventDefault();
      
      const confirmLeave = window.confirm(
        "If you go back, you'll lose your attempt. Are you sure you want to leave?"
      );

      if (confirmLeave) {
        router.push("/");
      } else {
        history.pushState(null, null, location.href);
      }
    };

    history.pushState(null, null, location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [router, showSummary]);

  const redirectToHome = () => {
    // Clear any stored quiz data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quizGroup');
      localStorage.removeItem('quizTest');
    }
    
    // Force redirect to home
    window.location.replace("/");
  };

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

  const QUIZ_DURATION = 7200; // 10 seconds for testing (change to 7200 for 2 hours)

  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [status, setStatus] = useState({});
  const [timer, setTimer] = useState(QUIZ_DURATION);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('Test User');
  const [Realname, setRealName] = useState('Test User');
  const [isClient, setIsClient] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [questionPaperOpen, setQuestionPaperOpen] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const [currentAttemptResponses, setCurrentAttemptResponses] = useState([]);

  const responseSheetRef = useRef(null);
  
  const scrollToResponseSheet = () => {
    if (responseSheetRef.current) {
      responseSheetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      const storedRealname = localStorage.getItem('name');
      const queryName = router.query.name;

      if (storedUsername) {
        setName(storedUsername);
      } else if (queryName) {
        setName(queryName);
      } else {
        setName('Test User');
      }  
      if (storedRealname) {
        setRealName(storedRealname);
      } else if (queryName) {
        setRealName(queryName);
      } else {
        setRealName('Test User');
      }
    }
  }, [router.query.name, router.isReady]);

  useEffect(() => {
    if (router.isReady && group && test) {
      fetchQuestions();
    }
  }, [router.isReady, group, test]);

  // Debug function to inspect question format
  useEffect(() => {
    if (questions.length > 0) {
      console.log('=== DEBUGGING QUESTION FORMAT ===');
      console.log('First question:', questions[0]);
      console.log('Correct answer field:', questions[0].correct);
      console.log('Type of correct field:', typeof questions[0].correct);
      console.log('Options array:', questions[0].options);
      console.log('=== END DEBUG ===');
    }
  }, [questions]);

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

      const res = await fetch("/api/decrease", {
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

  // Timer useEffect
  useEffect(() => {
    if (questions.length === 0 || showSummary || isSubmitting) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (!timerIntervalRef.current) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            
            // Auto-submit when time expires
            setTimeout(() => {
              setSubmissionMessage("Time's up! Auto-submitting your quiz...");
              setIsSubmitting(true);
              
              // Update current question status before calling handleSubmit
              setStatus(prevStatus => {
                const updatedStatus = { ...prevStatus };
                
                if (selectedOption[index]) {
                  if (markedQuestions[index]) {
                    updatedStatus[index] = "answered-marked";
                  } else {
                    updatedStatus[index] = "answered";
                  }
                } else if (prevStatus[index] === 'not-visited') {
                  updatedStatus[index] = "not-answered";
                }
                
                setTimeout(() => {
                  handleSubmit(true);
                }, 100);
                
                return updatedStatus;
              });
            }, 0);
            
            return 0;
          }
          
          if (prev === 300) {
            alert("⚠️ Warning: Only 5 minutes remaining!");
          }
          if (prev === 60) {
            alert("⚠️ Final Warning: Only 1 minute remaining!");
          }
          
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [questions.length, showSummary, isSubmitting, index, selectedOption, markedQuestions]);

  const handleOptionChange = (val) => {
    setSelectedOption(prev => ({ ...prev, [index]: val }));
    setStatus(prev => ({ ...prev, [index]: markedQuestions[index] ? "answered-marked" : "answered" }));
  };

  const nextQuestion = () => {
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
    if (status[index] === 'not-visited') {
      setStatus(prev => ({ ...prev, [index]: "not-answered" }));
    } else if (selectedOption[index] && status[index] !== "answered-marked" && status[index] !== "answered") {
      setStatus(prev => ({ ...prev, [index]: markedQuestions[index] ? "answered-marked" : "answered" }));
    } else if (!selectedOption[index] && status[index] !== "review" && status[index] !== "not-answered") {
      setStatus(prev => ({ ...prev, [index]: markedQuestions[index] ? "review" : "not-answered" }));
    }
    setIndex(questionIndex);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Update submission message based on submit type
    if (isAutoSubmit) {
      setSubmissionMessage("Auto-submitting quiz due to time expiry...");
    } else {
      setSubmissionMessage("Submitting your quiz...");
    }

    try {
      // Clear the timer immediately upon submission
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Get current state values at submission time
      let currentStatus = { ...status };
      const currentSelectedOptions = { ...selectedOption };
      const currentMarkedQuestions = { ...markedQuestions };
      
      // Update current question status
      if (currentSelectedOptions[index]) {
        if (currentMarkedQuestions[index]) {
          currentStatus[index] = "answered-marked";
        } else {
          currentStatus[index] = "answered";
        }
      } else if (currentStatus[index] === 'not-visited' || !currentStatus[index]) {
        currentStatus[index] = "not-answered";
      }

      // Ensure all questions have a status
      questions.forEach((_, i) => {
        if (!currentStatus[i]) {
          if (currentSelectedOptions[i]) {
            currentStatus[i] = currentMarkedQuestions[i] ? "answered-marked" : "answered";
          } else {
            currentStatus[i] = "not-visited";
          }
        }
      });

      // Calculate time elapsed for this specific attempt
      const timeElapsedSeconds = QUIZ_DURATION - timer;
      const attemptEndTime = new Date().toISOString();

      // Format time taken for display and storage
      const hoursTaken = Math.floor(timeElapsedSeconds / 3600);
      const minutesTaken = Math.floor((timeElapsedSeconds % 3600) / 60);
      const secondsTaken = timeElapsedSeconds % 60;
      const formattedTimeTaken = `${hoursTaken.toString().padStart(2, '0')}:${minutesTaken.toString().padStart(2, '0')}:${secondsTaken.toString().padStart(2, '0')}`;

      let scoreCalc = 0;
      let attemptedCount = 0;
      const responses = [];

      // Get current date and time in Indian timezone
      const currentDateTime = new Date();
      const indianDate = currentDateTime.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const indianTime = currentDateTime.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Enhanced correct answer detection function
      const getCorrectAnswer = (question) => {
        let correctAnswer;
        let correctOption = question.correct;
        
        if (typeof question.correct === 'string') {
          if (question.correct.length === 1 && /[A-Da-d]/.test(question.correct)) {
            const optionIndex = question.correct.toUpperCase().charCodeAt(0) - 65;
            if (optionIndex >= 0 && optionIndex < question.options.length) {
              correctAnswer = question.options[optionIndex];
            }
          } else if (question.options.includes(question.correct)) {
            correctAnswer = question.correct;
          } else if (!isNaN(question.correct) && parseInt(question.correct) < question.options.length) {
            const optionIndex = parseInt(question.correct);
            correctAnswer = question.options[optionIndex];
            correctOption = String.fromCharCode(65 + optionIndex);
          }
        } else if (typeof question.correct === 'number' && question.correct < question.options.length) {
          correctAnswer = question.options[question.correct];
          correctOption = String.fromCharCode(65 + question.correct);
        }
        
        if (!correctAnswer) {
          console.warn(`Could not determine correct answer for question:`, question);
          correctAnswer = question.options[0];
          correctOption = 'A';
        }
        
        return { correctAnswer, correctOption };
      };

      // Calculate score and prepare response data
      questions.forEach((q, i) => {
        const selectedAnswer = currentSelectedOptions[i];
        
        const { correctAnswer, correctOption } = getCorrectAnswer(q);
        
        const isAnswered = selectedAnswer !== undefined;
        const isCorrect = isAnswered && selectedAnswer === correctAnswer;
        const isMarkedForReview = currentMarkedQuestions[i] || false;
        const questionStatus = currentStatus[i] || 'not-visited';

        if (isAnswered) {
          attemptedCount++;
          if (isCorrect) {
            scoreCalc++;
          }
        }

        const responseData = {
          attemptId: attemptId,
          username: localStorage.getItem('username') || name,
          group: decodeURIComponent(group),
          test: decodeURIComponent(test),
          questionId: q._id || q.id,
          questionNumber: i + 1,
          questionText: q.question,
          options: q.options,
          correctAnswer: correctAnswer,
          correctOption: correctOption,
          selectedOption: selectedAnswer || null,
          isCorrect: isCorrect,
          markedForReview: isMarkedForReview,
          status: questionStatus,
          attemptStartTime: attemptStartTime,
          attemptEndTime: attemptEndTime,
          submittedAt: currentDateTime.toISOString(),
          submittedDate: indianDate,
          submittedTime: indianTime,
          timeTaken: formattedTimeTaken,
          timeElapsed: timeElapsedSeconds,
          totalQuestions: questions.length,
          totalScore: scoreCalc,
          totalAttempted: attemptedCount,
          percentage: ((scoreCalc / questions.length) * 100).toFixed(2),
          isAutoSubmit: isAutoSubmit
        };
        responses.push(responseData);
      });

      setCurrentAttemptResponses(responses);
      setScore(scoreCalc);
      
      const actualUsername = localStorage.getItem('username') || name;

      const resultData = {
        attemptId: attemptId,
        name: actualUsername,
        group: decodeURIComponent(group),
        test: decodeURIComponent(test),
        score: scoreCalc,
        attempted: attemptedCount,
        unattempted: questions.length - attemptedCount,
        total: questions.length,
        percentage: ((scoreCalc / questions.length) * 100).toFixed(2),
        finalResult: ((scoreCalc / questions.length) * 100) >= 40 ? "PASS" : "FAIL",
        timeTaken: formattedTimeTaken,
        submittedAt: currentDateTime.toISOString(),
        submittedDate: indianDate,
        submittedTime: indianTime,
        attemptStartTime: attemptStartTime,
        attemptEndTime: attemptEndTime,
        isAutoSubmit: isAutoSubmit
      };

      setSubmissionMessage("Saving your results...");

      // Submit overall quiz results
      const submitResultRes = await fetch("/api/results/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData)
      });

      if (!submitResultRes.ok) {
        const errorText = await submitResultRes.text();
        console.error('Failed to submit overall quiz results:', errorText);
        throw new Error('Failed to save quiz results');
      }

      // Submit individual question responses
      const submitResponsesRes = await fetch("/api/Response/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses,
          attemptId: attemptId,
          metadata: {
            username: actualUsername,
            group: decodeURIComponent(group),
            test: decodeURIComponent(test),
            totalQuestions: questions.length,
            totalScore: scoreCalc,
            totalAttempted: attemptedCount,
            percentage: ((scoreCalc / questions.length) * 100).toFixed(2),
            finalResult: ((scoreCalc / questions.length) * 100) >= 40 ? "PASS" : "FAIL",
            submittedAt: currentDateTime.toISOString(),
            submittedDate: indianDate,
            submittedTime: indianTime,
            timeElapsed: timeElapsedSeconds,
            isAutoSubmit: isAutoSubmit
          }
        })
      });

      if (!submitResponsesRes.ok) {
        const errorText = await submitResponsesRes.text();
        console.error('Failed to submit individual responses:', errorText);
        throw new Error('Failed to save detailed responses');
      }

      // Success - show results
      setSubmissionMessage("Quiz submitted successfully!");
      setTimeout(() => {
        setShowSummary(true);
        setShowSubmitConfirm(false);
        setIsSubmitting(false);
        setSubmissionMessage("");
      }, 1000);

    } catch (err) {
      console.error('An error occurred during quiz submission:', err);
      setSubmissionMessage(`Submission failed: ${err.message}`);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionMessage("");
        
        if (isAutoSubmit) {
          alert("There was an error saving your quiz, but time has expired. Showing results based on your current progress.");
          setShowSummary(true);
          setShowSubmitConfirm(false);
        }
      }, 3000);
    }
  };

  const getQuestionStats = () => {
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

  // Show submission overlay when submitting
  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {timer <= 0 ? "Time's Up!" : "Submitting Quiz"}
          </h2>
          <p className="text-gray-600 mb-4">{submissionMessage}</p>
          <div className="text-sm text-gray-500">
            Please wait, do not close this window...
          </div>
        </div>
      </div>
    );
  }

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
      const params = new URLSearchParams({
        name: encodeURIComponent(name),
        group: encodeURIComponent(group),
        test: encodeURIComponent(test),
        score: score,
        total: questions.length,
        timeTaken: formatElapsedTimeForDisplay(timeElapsedSeconds),
        percentage: ((score / questions.length) * 100).toFixed(1),
        result: ((score / questions.length) * 100) >= 40 ? 'PASS' : 'FAIL',
        attempted: getQuestionStats().answered + getQuestionStats().answeredMarked,
        notAttempted: getQuestionStats().notAnswered + getQuestionStats().notVisited + getQuestionStats().review,
        attemptId: attemptId
      }).toString();

      try {
        window.open(`/api/generate-pdf?${params}`, '_blank');
      } catch (error) {
        console.error("Error initiating PDF download:", error);
        alert("Failed to download PDF. Please try again.");
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-4xl w-full mx-auto">
          <div id="result-summary" className="bg-white rounded-xl shadow-2xl p-6 sm:p-10 md:p-12 border border-gray-200">
            {/* Results Header with No-Refresh Warning */}
            <div className="text-center mb-6">
              
              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
                📊 Quiz Results
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
              {/* Results display cards */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-7 bg-blue-50 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-200 ease-in-out border border-blue-100">
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-1 sm:mb-2 leading-none">{score}</div>
                <div className="text-sm sm:text-base text-gray-700 font-medium text-center">Correct Answers</div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 sm:p-7 bg-green-50 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-200 ease-in-out border border-green-100">
                <div className="text-3xl sm:text-4xl font-extrabold text-green-700 mb-1 sm:mb-2 leading-none">
                  {((score / questions.length) * 100).toFixed(1)}%
                </div>
                <div className="text-sm sm:text-base text-gray-700 font-medium text-center">Percentage</div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 sm:p-7 bg-purple-50 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-200 ease-in-out border border-purple-100">
                <div className="text-3xl sm:text-4xl font-extrabold text-purple-700 mb-1 sm:mb-2 leading-none">
                  {getQuestionStats().answered + getQuestionStats().answeredMarked}
                </div>
                <div className="text-sm sm:text-base text-gray-700 font-medium text-center">Attempted</div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 sm:p-7 bg-orange-50 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-200 ease-in-out border border-orange-100">
                <div className="text-3xl sm:text-4xl font-extrabold text-orange-700 mb-1 sm:mb-2 leading-none">
                  {questions.length - (getQuestionStats().answered + getQuestionStats().answeredMarked)}
                </div>
                <div className="text-sm sm:text-base text-gray-700 font-medium text-center">Not Attempted</div>
              </div>
            </div>

            <div className="text-center mb-8 sm:mb-10">
              <div className={`text-4xl sm:text-5xl font-extrabold mb-3 sm:mb-5 tracking-tight ${
                ((score / questions.length) * 100) >= 40 ? 'text-green-600' : 'text-red-600'
              }`}>
                {((score / questions.length) * 100) >= 40 ? '✅ PASS' : '❌ FAIL'}
              </div>
              <div className="text-base sm:text-lg text-gray-700 mb-2 font-semibold">
                Time Taken: {formatElapsedTimeForDisplay(timeElapsedSeconds)}
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                Candidate: <span className="font-medium">{Realname}</span> | Test: <span className="font-medium">{decodeURIComponent(group)}</span> - <span className="font-medium">{decodeURIComponent(test)}</span>
              </div>
              
              {/* Show auto-submit notification if applicable */}
              {timer <= 0 && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⏰ This quiz was automatically submitted due to time expiry.
                  </p>
                </div>
              )}
            </div>

            {/* View Response Sheet Button */}
            <div className="text-center mt-6 sm:mt-8">
              <button
                onClick={scrollToResponseSheet}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-base sm:text-lg font-semibold border-b-2 border-blue-600 hover:border-blue-800 pb-1"
              >
                View Detailed Response Sheet 👇
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-center mt-6 sm:mt-8 space-y-4 sm:space-y-0 sm:space-x-5">
              <button
                onClick={handleDownloadPdf}
                className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-green-700 transition-colors duration-200 ease-in-out text-base sm:text-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                📥 Download Results PDF
              </button>
              <button
                onClick={redirectToHome}
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 ease-in-out text-base sm:text-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                🏠 Back to Home
              </button>
            </div>

            {/* Response Sheet */}
            <div ref={responseSheetRef}>
              <ResponseSheet
                questions={questions}
                selectedOptions={selectedOption}
              />
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
                  // Restart timer if user cancels submission
                  if (!timerIntervalRef.current && timer > 0 && !showSummary && !isSubmitting) {
                    timerIntervalRef.current = setInterval(() => {
                      setTimer(prev => {
                        if (prev <= 1) {
                          clearInterval(timerIntervalRef.current);
                          timerIntervalRef.current = null;
                          setSubmissionMessage("Time's up! Auto-submitting your quiz...");
                          setIsSubmitting(true);
                          setTimeout(() => {
                            setStatus(prevStatus => {
                              const updatedStatus = { ...prevStatus };
                              if (selectedOption[index]) {
                                if (markedQuestions[index]) {
                                  updatedStatus[index] = "answered-marked";
                                } else {
                                  updatedStatus[index] = "answered";
                                }
                              } else {
                                if (prevStatus[index] === 'not-visited') {
                                  updatedStatus[index] = "not-answered";
                                }
                              }
                              setTimeout(() => {
                                handleSubmit(true);
                              }, 100);
                              return updatedStatus;
                            });
                          }, 1000);
                          return 0;
                        }
                        if (prev === 300) {
                          alert("⚠️ Warning: Only 5 minutes remaining!");
                        }
                        if (prev === 60) {
                          alert("⚠️ Final Warning: Only 1 minute remaining!");
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
                onClick={() => handleSubmit(false)}
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
              <span className={`font-bold ${timer <= 300 ? 'text-red-200 animate-pulse' : 'text-red-200'}`}>
                {formatTime(timer)}
              </span>
              {timer <= 60 && timer > 0 && (
                <div className="text-xs text-red-200 animate-bounce">
                  ⚠️ Hurry up!
                </div>
              )}
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
                    {questions[index].question.replace(/^Q\d+\)\s*/i, "")}
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
                          disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark For Review & Next
              </button>
              <button
                onClick={clearResponse}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs sm:px-6 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
              <button
                onClick={nextQuestion}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs sm:px-6 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={isSubmitting}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1.5 sm:p-2 rounded-l hover:bg-blue-600 transition-colors z-50 disabled:opacity-50"
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
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full text-center leading-5 sm:leading-6 font-semibold text-gray-700">
                    {stats.notVisited}
                  </div>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full text-center leading-5 sm:leading-6 font-semibold">
                    {stats.notAnswered}
                  </div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full text-center leading-5 sm:leading-6 font-semibold">
                    {stats.answered}
                  </div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white rounded-full text-center leading-5 sm:leading-6 font-semibold">
                    {stats.review}
                  </div>
                  <span>Marked For Review</span>
                </div>
              </div>
              <div className="mt-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 text-white rounded-full text-center leading-5 sm:leading-6 font-semibold">
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
                      disabled={isSubmitting}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
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