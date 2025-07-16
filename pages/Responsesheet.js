// components/ResponseSheet.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';

const ResponseSheet = ({ username, group, test, questions, attemptId: propAttemptId }) => {
  const [userResponses, setUserResponses] = useState([]);
  const [fetchingResponses, setFetchingResponses] = useState(true);
  const [responsesError, setResponsesError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // New state for navigation

  // Memoize questions prop to avoid unnecessary re-sorts if questions array reference changes
  const sortedOriginalQuestions = useMemo(() => {
    // Ensure original questions are sorted for consistent indexing
    return [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
  }, [questions]);

  const fetchUserResponses = useCallback(async () => {
    setFetchingResponses(true);
    setResponsesError(null);

    try {
      const decodedGroup = decodeURIComponent(group);
      const decodedTest = decodeURIComponent(test);

      // CRITICAL: Ensure attemptId is passed to fetch specific attempt's responses
      if (!username || !decodedGroup || !decodedTest || !propAttemptId) {
        console.warn("Missing quiz parameters or attemptId for fetching responses in ResponseSheet. Aborting fetch.");
        setResponsesError("Quiz parameters or attempt ID missing. Cannot fetch responses.");
        setFetchingResponses(false);
        return;
      }

      const queryParams = new URLSearchParams({
        username: username,
        group: decodedGroup,
        test: decodedTest,
        attemptId: propAttemptId // Pass the attemptId
      });

      // API route needs to be updated to filter by attemptId
      const res = await fetch(`/api/Response/get?${queryParams.toString()}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch user responses: ${errorData.message || res.statusText}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.responses)) {
        // Sort responses based on their questionNumber or original questions order
        const sortedFetchedResponses = data.responses.sort((a, b) => {
          const originalQ_A = sortedOriginalQuestions.find(q => q._id === a.questionId);
          const originalQ_B = sortedOriginalQuestions.find(q => q._id === b.questionId);
          return (originalQ_A?.questionNumber || 0) - (originalQ_B?.questionNumber || 0);
        });
        setUserResponses(sortedFetchedResponses);
        setResponsesError(null);
        setCurrentQuestionIndex(0); // Reset to the first question when new responses are loaded
      } else {
        console.warn("API response was successful but responses array is missing or invalid.", data);
        setUserResponses([]);
        setResponsesError("Failed to parse response data.");
      }
    } catch (err) {
      console.error('Error fetching user responses in ResponseSheet:', err);
      setResponsesError(err.message);
    } finally {
      setFetchingResponses(false);
    }
  }, [username, group, test, propAttemptId, sortedOriginalQuestions]); // Add propAttemptId to dependencies

  useEffect(() => {
    fetchUserResponses();
  }, [fetchUserResponses]);

  const handleRetry = useCallback(() => {
    fetchUserResponses();
  }, [fetchUserResponses]);

  // Derive the current response based on currentQuestionIndex
  const currentResponse = userResponses[currentQuestionIndex];
  const currentOriginalQuestion = currentResponse
    ? sortedOriginalQuestions.find(q => q._id === currentResponse.questionId)
    : null;

  // Navigation handlers
  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prevIndex => Math.min(prevIndex + 1, userResponses.length - 1));
  }, [userResponses.length]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex(prevIndex => Math.max(prevIndex - 1, 0));
  }, []);

  const getCorrectAnswerText = useCallback((questionId) => {
    const originalQuestion = sortedOriginalQuestions.find(q => q._id === questionId);
    return originalQuestion
      ? originalQuestion.options[originalQuestion.correct.charCodeAt(0) - 65]
      : 'N/A (Question Not Found)';
  }, [sortedOriginalQuestions]);

  const getOptionStyle = useCallback((option, response, correctAnswer) => {
    const isSelected = response.selectedOption === option;
    const isCorrect = option === correctAnswer;

    if (isSelected) {
      return isCorrect ? 'bg-green-500' : 'bg-red-500';
    }
    // Highlight correct answer even if not selected by user
    return isCorrect ? 'bg-green-500' : 'bg-gray-400';
  }, []);

  const getTextStyle = useCallback((option, response, correctAnswer) => {
    const isSelected = response.selectedOption === option;
    const isCorrect = option === correctAnswer;

    if (isSelected) {
      return isCorrect ? 'font-bold text-green-700' : 'font-bold text-red-700';
    }
    return isCorrect ? 'font-bold text-green-700' : 'text-gray-700';
  }, []);


  // --- Loading, Error, No Responses States ---
  if (fetchingResponses) {
    return (
      <div className="mt-8 pt-8 border-t-2 border-gray-200">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">Detailed Response Sheet</h3>
        <div className="text-center text-gray-600 p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          Loading responses...
        </div>
      </div>
    );
  }

  if (responsesError) {
    return (
      <div className="mt-8 pt-8 border-t-2 border-gray-200">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">Detailed Response Sheet</h3>
        <div className="text-center text-red-600 p-4">
          <div className="text-red-500 text-3xl mb-2">⚠️</div>
          <p className="mb-4">Error: {responsesError}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (userResponses.length === 0) {
    return (
      <div className="mt-8 pt-8 border-t-2 border-gray-200">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">Detailed Response Sheet</h3>
        <div className="text-center text-gray-600 p-4">
          <p>No detailed responses found for this test and attempt ID.</p>
          <p className="text-sm mt-1">This might happen if there was an issue saving them or no questions were attempted.</p>
        </div>
      </div>
    );
  }

  // --- Main Render for Single Question View ---
  return (
    <div className="mt-8 pt-8 border-t-2 border-gray-200">
      <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">Detailed Response Sheet</h3>

      <div className="text-center text-gray-600 mb-4">
        Question {currentQuestionIndex + 1} of {userResponses.length}
      </div>

      {currentResponse && currentOriginalQuestion ? (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Question {currentOriginalQuestion.questionNumber}:</h4>
          <p className="text-gray-700 mb-3 leading-relaxed">{currentOriginalQuestion.question}</p>

          <div className="space-y-2 mb-3">
            {currentOriginalQuestion.options.map((opt, optIndex) => {
              const correctAnswerText = getCorrectAnswerText(currentResponse.questionId);
              return (
                <div key={optIndex} className="flex items-center space-x-2">
                  <span
                    className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold ${getOptionStyle(opt, currentResponse, correctAnswerText)}`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className={`text-sm ${getTextStyle(opt, currentResponse, correctAnswerText)}`}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-sm">
            <p className="mb-1">
              <span className="font-medium">Your Answer: </span>
              <span className={`${currentResponse.selectedOption ? '' : 'italic text-gray-500'}`}>
                {currentResponse.selectedOption || 'Not Attempted'}
              </span>
            </p>
            <p className="mb-1">
              <span className="font-medium">Correct Answer: </span>
              <span className="font-bold text-green-700">
                {getCorrectAnswerText(currentResponse.questionId)}
              </span>
            </p>
            <p className="mb-1">
              <span className="font-medium">Result: </span>
              {currentResponse.selectedOption === undefined || currentResponse.selectedOption === null ? (
                <span className="text-gray-600">Unattempted</span>
              ) : currentResponse.isCorrect ? (
                <span className="text-green-600 font-semibold">Correct</span>
              ) : (
                <span className="text-red-600 font-semibold">Incorrect</span>
              )}
            </p>
            <p className="mb-1">
              <span className="font-medium">Status on Submission: </span>
              <span className="capitalize">{currentResponse.status.replace('-', ' ')}</span>
              {currentResponse.markedForReview && <span className="ml-1 text-yellow-600">(Marked for Review)</span>}
            </p>
            <p className="mb-1">
              <span className="font-medium">Submitted On: </span>
              <span className="text-gray-700">{currentResponse.submittedDate} at {currentResponse.submittedTime}</span>
            </p>
            <p>
              <span className="font-medium">Time Taken for this Quiz: </span>
              <span className="text-gray-700">{currentResponse.timeTaken}</span>
            </p>
            <p>
              <span className="font-medium">Question Time Elapsed (from start of quiz): </span>
              <span className="text-gray-700">{currentResponse.timeElapsed} seconds</span>
            </p>
            <p>
              <span className="font-medium">Attempt ID: </span>
              <span className="font-mono text-gray-700 text-xs break-all">{currentResponse.attemptId}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600 p-4">
          <p>No response data available for this question index.</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 px-4">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Previous
        </button>
        <button
          onClick={goToNextQuestion}
          disabled={currentQuestionIndex === userResponses.length - 1}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ResponseSheet;