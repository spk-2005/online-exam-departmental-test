import React, { useEffect, useState, useRef } from "react";
import { Clock, User, CheckCircle, AlertCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";

export default function Samplequiz() {
  const [name, setName] = useState('Demo User');
  const [showNameInput, setShowNameInput] = useState(true);
  const [tempName, setTempName] = useState('');

  const timerIntervalRef = useRef(null);

  // Sample questions data
  const sampleQuestions = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: "C"
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: "B"
    },
    {
      question: "What is 15 + 27?",
      options: ["41", "42", "43", "44"],
      correct: "B"
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correct: "C"
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correct: "D"
    },
    {
      question: "Which programming language is known for its use in web development?",
      options: ["C++", "Java", "JavaScript", "Python"],
      correct: "C"
    },
    {
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correct: "C"
    },
    {
      question: "Which year did World War II end?",
      options: ["1944", "1945", "1946", "1947"],
      correct: "B"
    },
    {
      question: "What is the square root of 64?",
      options: ["6", "7", "8", "9"],
      correct: "C"
    },
    {
      question: "Which continent is the largest by area?",
      options: ["Africa", "Asia", "North America", "Europe"],
      correct: "B"
    }
  ];

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

  const [questions] = useState(sampleQuestions);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [status, setStatus] = useState(() => {
    const initialStatus = {};
    sampleQuestions.forEach((_, i) => {
      initialStatus[i] = 'not-visited';
    });
    return initialStatus;
  });
  const [timer, setTimer] = useState(600); // 10 minutes for demo
  const [showSummary, setShowSummary] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [score, setScore] = useState(0);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = () => {
    if (tempName.trim()) {
      setName(tempName.trim());
      setShowNameInput(false);
      setQuizStarted(true);
    }
  };

  useEffect(() => {
    if (!quizStarted || showSummary) return;

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

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [quizStarted, showSummary]);

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

  const handleSubmit = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    let scoreCalc = 0;
    let attemptedCount = 0;

    questions.forEach((q, i) => {
      if (selectedOption[i] !== undefined) {
        attemptedCount++;
        if (selectedOption[i] === q.options[q.correct.charCodeAt(0) - 65]) {
          scoreCalc++;
        }
      }
    });

    setScore(scoreCalc);
    setShowSummary(true);
    setShowSubmitConfirm(false);
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

  const resetQuiz = () => {
    setIndex(0);
    setSelectedOption({});
    setMarkedQuestions({});
    const initialStatus = {};
    questions.forEach((_, i) => {
      initialStatus[i] = 'not-visited';
    });
    setStatus(initialStatus);
    setTimer(600);
    setShowSummary(false);
    setShowSubmitConfirm(false);
    setScore(0);
    setQuizStarted(false);
    setShowNameInput(true);
    setTempName('');
  };

  // Name input screen
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Demo Quiz</h1>
            <p className="text-gray-600">Welcome to the sample quiz test</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name:
            </label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
              onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Quiz Details:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 10 Multiple Choice Questions</li>
              <li>• Time Limit: 10 minutes</li>
              <li>• Passing Score: 40%</li>
              <li>• Topics: General Knowledge</li>
            </ul>
          </div>

          <button
            onClick={startQuiz}
            disabled={!tempName.trim()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (showSummary) {
    const totalQuizDuration = 600;
    const timeElapsedSeconds = totalQuizDuration - timer;
    const attempted = getQuestionStats().answered + getQuestionStats().answeredMarked;
    const percentage = ((score / questions.length) * 100).toFixed(1);

    const formatElapsedTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    };

    return (
      <div className="min-h-screen bg-gray-100 py-12 flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              📊 Quiz Results
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{score}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{percentage}%</div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">{attempted}</div>
                <div className="text-sm text-gray-600">Attempted</div>
              </div>

              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">{questions.length - attempted}</div>
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
                Time Taken: {formatElapsedTime(timeElapsedSeconds)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Candidate: {name} | Demo Quiz - General Knowledge
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Answer Review:</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm">
                    <span className="font-medium text-gray-600 w-8">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="text-gray-800">{q.question}</div>
                      <div className="mt-1">
                        <span className="text-green-600 font-medium">
                          Correct: {q.options[q.correct.charCodeAt(0) - 65]}
                        </span>
                        {selectedOption[i] && (
                          <span className={`ml-4 font-medium ${
                            selectedOption[i] === q.options[q.correct.charCodeAt(0) - 65] 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            Your Answer: {selectedOption[i]} {
                              selectedOption[i] === q.options[q.correct.charCodeAt(0) - 65] ? '✓' : '✗'
                            }
                          </span>
                        )}
                        {!selectedOption[i] && (
                          <span className="ml-4 text-gray-500">Not attempted</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={resetQuiz}
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
              >
                Take Quiz Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Submit confirmation modal
  if (showSubmitConfirm) {
    const stats = getQuestionStats();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Submit Confirmation</h2>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Section</th>
                  <th className="border border-gray-300 p-3 text-center">Total</th>
                  <th className="border border-gray-300 p-3 text-center">Ans.</th>
                  <th className="border border-gray-300 p-3 text-center">Not Ans.</th>
                  <th className="border border-gray-300 p-3 text-center">Rev.</th>
                  <th className="border border-gray-300 p-3 text-center">Ans. & Rev.</th>
                  <th className="border border-gray-300 p-3 text-center">Not Visited</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 font-semibold">General Knowledge</td>
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
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                No
              </button>
              <button
                onClick={handleSubmit}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col select-none">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-yellow-400 font-bold text-lg">Demo Quiz - General Knowledge</span>
        </div>
        <div className="text-sm">
          <span>Time Remaining: </span>
          <span className="font-bold text-red-200">{formatTime(timer)}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className={`flex-1 bg-white transition-all duration-300 overflow-y-auto ${showRightPanel ? 'mr-80' : 'mr-0'}`}>
          {/* Test Header */}
          <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 px-2 py-1 rounded text-sm font-semibold">
                General Knowledge Quiz
              </span>
            </div>
            <div className="text-right text-sm">
              <span>Question {index + 1} of {questions.length}</span>
            </div>
          </div>

          {/* Question Type */}
          <div className="border-b border-gray-300 p-3 text-sm">
            <span className="font-semibold">Question Type: Multiple Choice</span>
          </div>

          {/* Question Number */}
          <div className="border-b border-gray-300 p-3">
            <span className="text-lg font-semibold">Question No. {index + 1}</span>
          </div>

          {/* Question Content */}
          <div className="p-6 min-h-96">
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
                    <span className="text-base text-gray-800 leading-relaxed">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-gray-300 p-4 flex justify-between bg-gray-50">
            <div className="flex space-x-2">
              <button
                onClick={prevQuestion}
                disabled={index === 0}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={markReview}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Mark For Review
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
                onClick={() => setShowSubmitConfirm(true)}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Submit
              </button>
              <button
                onClick={nextQuestion}
                disabled={index === questions.length - 1}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-300 transition-transform duration-300 z-40 ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Toggle Button */}
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-l hover:bg-blue-600 transition-colors z-50"
          >
            {showRightPanel ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="h-full overflow-y-auto">
            {/* User Info */}
            <div className="p-4 border-b border-gray-300 flex items-center space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">Candidate</div>
                <div className="text-sm text-gray-600">{name}</div>
              </div>
            </div>

            {/* Timer */}
            <div className="p-4 border-b border-gray-300 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-gray-800">Time Remaining</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{formatTime(timer)}</div>
            </div>

            {/* Status Legend */}
            <div className="p-4 border-b border-gray-300">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded text-center leading-6 font-semibold text-gray-700">
                    {getQuestionStats().notVisited}
                  </div>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-500 text-white rounded text-center leading-6 font-semibold">
                    {getQuestionStats().notAnswered}
                  </div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded text-center leading-6 font-semibold">
                    {getQuestionStats().answered}
                  </div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded text-center leading-6 font-semibold">
                    {getQuestionStats().review}
                  </div>
                  <span>Review</span>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded text-center leading-6 font-semibold">
                    {getQuestionStats().answeredMarked}
                  </div>
                  <span>Answered & Marked</span>
                </div>
              </div>
            </div>

            {/* Question Navigator */}
            <div className="p-4">
              <div className="bg-blue-500 text-white p-2 text-center font-semibold rounded-t">
                General Knowledge Quiz
              </div>
              <div className="bg-blue-300 text-white p-2 text-center font-semibold">
                Choose Question
              </div>
              <div className="bg-gray-50 p-4 rounded-b">
                <div className="grid grid-cols-5 gap-2">
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