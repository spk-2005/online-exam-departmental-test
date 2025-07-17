import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Instruction2() {
  const [shownext, setShownext] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const router = useRouter();
  
  const { test } = router.query;
  const handleCheckboxChange = (e) => setIsConfirmed(e.target.checked);

  const handleOK = () => {
    if (isConfirmed) {
      localStorage.setItem("quizTest", test);
      router.push("/Samplequiz");
    }
  };

  const handleNext = () => setShownext(false);
  const handlePrevious = () => setShownext(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Main Instructions Panel */}
            <div className="flex-1 p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {shownext ? 'Instructions' : 'Other Important Instructions'}
                </h1>
                
                {shownext && (
                  <div className="text-center mb-6">
                    <p className="text-lg text-gray-600">Please read the instructions carefully</p>
                  </div>
                )}
              </div>

              {/* First page instructions */}
              <div className={`space-y-6 ${shownext ? 'block' : 'hidden'}`}>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">General Instructions</h2>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Total duration of examination is 120 minutes.</li>
                    <li>The clock will be set at the server. The countdown timer in the top right corner of the screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
                    <li>The Question Palette displayed on the right side of the screen will show the status of each question using one of the following symbols:</li>
                  </ol>
                </div>

                <div className="ml-8">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-gray-300 rounded mr-3"></span>
                      You have not visited the question yet.
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-red-300 rounded mr-3"></span>
                      You have not answered the question.
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-300 rounded mr-3"></span>
                      You have answered the question.
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-yellow-300 rounded mr-3"></span>
                      You have NOT answered the question but have marked it for review.
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-blue-300 rounded mr-3"></span>
                      You have answered the question but marked it for review.
                    </li>
                  </ul>
                </div>

                <div>
                  <ol className="list-decimal list-inside space-y-4 text-gray-700" start="4">
                    <li>You can click on the &quot;&quot; arrow which appears to the left of the question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on  which appears on the right side of the question window.</li>
                    
                    <li>
                      <div className="font-semibold mb-2">Navigating to a Question:</div>
                      To answer a question, do the following:
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                        <li>Click on Save & Next to save your answer for the current question and then go to the next question.</li>
                        <li>Click on Mark for Review & Next to save your answer for the current question, mark it for review, and then go to the next question.</li>
                      </ul>
                    </li>
                    
                    <li>
                      <div className="font-semibold mb-2">Answering a Question:</div>
                      Procedure for answering a multiple choice type question:
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>To select your answer, click on the button of one of the options.</li>
                        <li>To deselect your chosen answer, click on the button of the chosen option again or click on the Clear Response button.</li>
                        <li>To change your chosen answer, click on the button of another option.</li>
                        <li>To save your answer, you MUST click on the Save & Next button.</li>
                        <li>To mark the question for review, click on the Mark for Review & Next button.</li>
                      </ul>
                    </li>
                    
                    <li>To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.</li>
                    
                    <li>
                      <div className="font-semibold mb-2">Navigating through sections:</div>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by clicking on the section name. The section you are currently viewing is highlighted.</li>
                        <li>After clicking the Save & Next button on the last question for a section, you will automatically be taken to the first question of the next section.</li>
                        <li>You can shuffle between sections and questions anytime during the examination as per your convenience only during the time stipulated.</li>
                        <li>Candidate can view the corresponding section summary as part of the legend that appears in every section above the question palette.</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Second page instructions */}
              <div className={`${shownext ? 'hidden' : 'block'}`}>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-yellow-800 mb-4">Important Notice</h2>
                  <p className="text-yellow-700">
                    This is a Mock test. The Question paper displayed is for practice purposes only. 
                    Under no circumstances should this be presumed as a sample paper.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <label className="flex items-start space-x-3 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="confirm"
                        onChange={handleCheckboxChange}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm leading-relaxed">
                        I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. 
                        I declare that I am not in possession of/not wearing/not carrying any prohibited gadget like mobile phone, 
                        bluetooth devices etc. /any prohibited material with me into the Examination Hall. I agree that in case of not 
                        adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, 
                        which may include ban from future Tests/Examinations.
                      </span>
                    </label>
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleOK}
                      disabled={!isConfirmed}
                      className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                        isConfirmed
                          ? 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      I am ready to begin
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* User Panel */}
            <div className="lg:w-80 bg-blue-50 p-8 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="text-gray-600 mt-2">Test: {test}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handlePrevious}
            className={`px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ${
              shownext ? 'invisible' : 'visible'
            }`}
          >
            ← Previous
          </button>
          
          <button
            onClick={handleNext}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              shownext ? 'visible' : 'invisible'
            }`}
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  );
}