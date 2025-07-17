// components/SampleResponseSheet.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';

const SampleResponseSheet = ({ 
  questions: propQuestions = [], 
  selectedOptions = {} // Current selected options from quiz
}) => {
  // Defensive programming: Ensure 'questions' is an array.
  const questions = Array.isArray(propQuestions) ? propQuestions : [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Sort questions by question number if available
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
  }, [questions]);

  // Create response data from current quiz state
  const currentResponses = useMemo(() => {
    return sortedQuestions.map((question, index) => {
      const selectedOption = selectedOptions[index];
      const correctAnswer = question.correct;
      const isCorrect = selectedOption === correctAnswer;

      return {
        questionId: question._id || `question_${index}`,
        questionNumber: question.questionNumber || index + 1,
        question: question.question,
        options: question.options,
        selectedOption: selectedOption,
        correctAnswer: correctAnswer,
        correctAnswerText: getCorrectAnswerText(question),
        isCorrect: isCorrect
      };
    });
  }, [sortedQuestions, selectedOptions]);

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prevIndex => Math.min(prevIndex + 1, currentResponses.length - 1));
  }, [currentResponses.length]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex(prevIndex => Math.max(prevIndex - 1, 0));
  }, []);

  // Helper function to get correct answer text
  function getCorrectAnswerText(question) {
    if (!question.options || !question.correct) return 'N/A';
    
    // Handle different formats of correct answer
    let correctIndex;
    
    if (typeof question.correct === 'string') {
      // If correct answer is like 'A', 'B', 'C', 'D'
      if (question.correct.length === 1 && question.correct.match(/[A-D]/i)) {
        correctIndex = question.correct.toUpperCase().charCodeAt(0) - 65;
      } else {
        // If correct answer is the actual text
        return question.correct;
      }
    } else if (typeof question.correct === 'number') {
      // If correct answer is an index (0, 1, 2, 3)
      correctIndex = question.correct;
    } else {
      return 'N/A';
    }
    
    return question.options[correctIndex] || 'N/A';
  }

  const getSelectedAnswerText = useCallback((selectedOption, question) => {
    if (!selectedOption) return null;
    
    // If selectedOption is like 'A', 'B', 'C', 'D'
    if (typeof selectedOption === 'string' && selectedOption.length === 1 && selectedOption.match(/[A-D]/i)) {
      const index = selectedOption.toUpperCase().charCodeAt(0) - 65;
      return question.options[index] || selectedOption;
    }
    
    // If selectedOption is already the text
    return selectedOption;
  }, []);

  const getOptionStyle = useCallback((option, response) => {
    const selectedAnswerText = getSelectedAnswerText(response.selectedOption, sortedQuestions[currentQuestionIndex]);
    const isSelected = selectedAnswerText === option;
    const isCorrect = option === response.correctAnswerText;

    if (isSelected && isCorrect) {
      return 'bg-green-500'; // Correct answer selected
    } else if (isSelected && !isCorrect) {
      return 'bg-red-500'; // Wrong answer selected
    } else if (!isSelected && isCorrect) {
      return 'bg-green-500'; // Correct answer (not selected)
    } else {
      return 'bg-gray-400'; // Not selected, not correct
    }
  }, [currentQuestionIndex, sortedQuestions]);

  const getTextStyle = useCallback((option, response) => {
    const selectedAnswerText = getSelectedAnswerText(response.selectedOption, sortedQuestions[currentQuestionIndex]);
    const isSelected = selectedAnswerText === option;
    const isCorrect = option === response.correctAnswerText;

    if (isSelected && isCorrect) {
      return 'font-bold text-green-700'; // Correct answer selected
    } else if (isSelected && !isCorrect) {
      return 'font-bold text-red-700'; // Wrong answer selected
    } else if (!isSelected && isCorrect) {
      return 'font-bold text-green-700'; // Correct answer (not selected)
    } else {
      return 'text-gray-700'; // Not selected, not correct
    }
  }, [currentQuestionIndex, sortedQuestions]);

  // Common styles to apply to elements containing sensitive text
  const noSelectAndNoScreenshotStyle = {
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    KhtmlUserSelect: 'none',
    MozUserSelect: 'none',
    MsUserSelect: 'none',
    UserSelect: 'none',
    pointerEvents: 'auto',
    '-webkit-user-drag': 'none',
    filter: 'brightness(100%)',
  };

  // Prevent copy/paste and context menu
  useEffect(() => {
    const preventCopyPaste = (e) => {
      e.preventDefault();
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  // Handle empty states
  if (currentResponses.length === 0) {
    return (
      <div className="mt-8 pt-8 border-t-2 border-gray-200" style={noSelectAndNoScreenshotStyle}>
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">Detailed Response Sheet</h3>
        <div className="text-center text-gray-600 p-4">
          <p>No questions available to display responses.</p>
        </div>
      </div>
    );
  }

  const currentResponse = currentResponses[currentQuestionIndex];
  const currentQuestion = sortedQuestions[currentQuestionIndex];

  return (
    <div className="mt-8 pt-8 border-t-2 border-gray-200" style={noSelectAndNoScreenshotStyle}>
      <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-800">Detailed Response Sheet</h3>

      <div className="text-center text-gray-600 mb-4">
        Question {currentQuestionIndex + 1} of {currentResponses.length}
      </div>

      {currentResponse && currentQuestion ? (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Question {currentResponse.questionNumber}:</h4>
          <p className="text-gray-700 mb-3 leading-relaxed">{currentQuestion.question}</p>

          <div className="space-y-2 mb-3">
            {currentQuestion.options.map((opt, optIndex) => {
              return (
                <div key={optIndex} className="flex items-center space-x-2">
                  <span
                    className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold ${getOptionStyle(opt, currentResponse)}`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className={`text-sm ${getTextStyle(opt, currentResponse)}`}>
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
                {currentResponse.selectedOption 
                  ? getSelectedAnswerText(currentResponse.selectedOption, currentQuestion) || 'Not Attempted'
                  : 'Not Attempted'
                }
              </span>
            </p>
            <p className="mb-1">
              <span className="font-medium">Correct Answer: </span>
              <span className="font-bold text-green-700">
                {currentResponse.correctAnswerText}
              </span>
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
          disabled={currentQuestionIndex === currentResponses.length - 1}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Next
        </button>
      </div>

    
    </div>
  );
};

export default SampleResponseSheet;