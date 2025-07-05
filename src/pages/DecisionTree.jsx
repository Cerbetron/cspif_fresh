import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Cookie utilities
const setCookie = (name, value, days = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

const DecisionTree = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [otherInputValue, setOtherInputValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Fixed 4 questions - no conditional logic
  const questions = [
    {
      id: 1,
      category: "System Affiliation",
      question: "What system are you affiliated with?",
      options: [
        "Child Welfare Services (CWS)",
        "Behavioral Health (BH)",
        "Education",
        "Probation",
        "Regional Center",
        "Community Partner",
        "Other"
      ],
      tags: ["system", "affiliation", "role", "department"]
    },
    {
      id: 2,
      category: "Professional Role",
      question: "What role do you most closely identify with?",
      options: [
        "Direct Services",
        "Leadership/Management",
        "Fiscal/Administrative",
        "Case Management",
        "Clinical Services",
        "Other"
      ],
      tags: ["role", "position", "job", "responsibility"]
    },
    {
      id: 3,
      category: "Resource Type",
      question: "What type of resources are you looking for?",
      options: [
        "Services & Support Programs",
        "Placement Options",
        "Training & Technical Assistance",
        "Funding & Financial Support",
        "Assessment Tools",
        "Other"
      ],
      tags: ["resources", "services", "placement", "support"]
    },
    {
      id: 4,
      category: "Target Population",
      question: "What population are you primarily serving?",
      options: [
        "Children (0-12 years)",
        "Adolescents (13-17 years)",
        "Transition Age Youth (18-21 years)",
        "Families",
        "All Age Groups",
        "Other"
      ],
      tags: ["population", "age", "demographics", "clients"]
    }
  ];

  // Load saved answers from cookies on component mount
  useEffect(() => {
    const savedAnswers = getCookie('decisionTreeAnswers');
    if (savedAnswers) {
      setAnswers(savedAnswers);
    }
  }, []);

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

  // Handle answer selection
  const handleAnswerSelect = (option) => {
    if (option === "Other") {
      setShowOtherInput(true);
      setOtherInputValue('');
      return;
    }

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: option
    };
    
    setAnswers(newAnswers);
    setCookie('decisionTreeAnswers', newAnswers);
    
    // Move to next question or finish
    handleNext();
  };

  // Handle "Other" input submission
  const handleOtherSubmit = () => {
    if (otherInputValue.trim()) {
      const newAnswers = {
        ...answers,
        [currentQuestion.id]: `Other: ${otherInputValue.trim()}`
      };
      
      setAnswers(newAnswers);
      setCookie('decisionTreeAnswers', newAnswers);
      setShowOtherInput(false);
      setOtherInputValue('');
      
      handleNext();
    }
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Decision tree complete, navigate to resources page
      navigate('/resources');
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Skip to resources page
  const handleSkip = () => {
    navigate('/resources');
  };

  // Reset all answers
  const resetAnswers = () => {
    setAnswers({});
    setCookie('decisionTreeAnswers', {});
    setCurrentQuestionIndex(0);
  };

  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Check if user has completed the decision tree before
  const hasCompletedBefore = Object.keys(answers).length > 0;

  // Welcome screen for first-time users
  if (!hasCompletedBefore && currentQuestionIndex === 0 && Object.keys(answers).length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f8ff] flex flex-col">
        <Header />
        
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl w-full text-center">
            <div className="bg-white rounded-xl shadow-lg p-12 mb-8">
              <h1 className="text-4xl font-bold text-[#015AB8] mb-6">
                Welcome to the System of Care Coordination Tool
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                This decision tree will help you find personalized resources based on your specific needs and system affiliation. 
                Answer 4 simple questions to get started with tailored recommendations.
              </p>
              
              {/* Quick Tags Preview */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#015AB8] mb-4">We'll ask about:</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {questions.map((q, index) => (
                    <div key={q.id} className="bg-[#E2E4FB] text-[#015AB8] px-4 py-2 rounded-full text-sm font-medium">
                      {index + 1}. {q.category}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setCurrentQuestionIndex(0)}
                  className="bg-[#015AB8] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#014a9f] transition-colors"
                >
                  Start Decision Tree (4 Questions)
                </button>
                
                <button
                  onClick={handleSkip}
                  className="bg-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-400 transition-colors"
                >
                  Skip to All Resources
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8ff] flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#015AB8]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[#015AB8]">
                  {Math.round(progress)}% Complete
                </span>
                <button
                  onClick={resetAnswers}
                  className="text-sm text-[#CB3525] hover:text-[#b53e2f] font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#015AB8] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Overview */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border-l-4 border-[#015AB8]">
            <h3 className="text-lg font-semibold text-[#015AB8] mb-2">All Questions Preview:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions.map((q, index) => (
                <div 
                  key={q.id} 
                  className={`p-3 rounded-lg border-2 transition-all ${
                    index === currentQuestionIndex 
                      ? 'border-[#015AB8] bg-[#E2E4FB]' 
                      : answers[q.id] 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {index + 1}. {q.category}
                    </span>
                    {answers[q.id] && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  {answers[q.id] && (
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {answers[q.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block bg-[#E2E4FB] text-[#015AB8] px-3 py-1 rounded-full text-sm font-medium">
                  {currentQuestion.category}
                </span>
                {currentQuestion.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
              <h2 
                className="text-2xl font-semibold text-[#333] leading-tight"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  lineHeight: '1.3'
                }}
              >
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option || 
                                 (option === "Other" && answers[currentQuestion.id]?.startsWith("Other:"));
                
                return (
                  <div key={index} className="space-y-3">
                    <button
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#E2E4FB] border-[#015AB8] text-[#015AB8]'
                          : 'bg-white border-gray-200 hover:border-[#015AB8] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                          isSelected 
                            ? 'border-[#015AB8] bg-[#015AB8]' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-lg font-medium">
                          {option === "Other" && answers[currentQuestion.id]?.startsWith("Other:") 
                            ? answers[currentQuestion.id] 
                            : option}
                        </span>
                      </div>
                    </button>

                    {/* Other Input */}
                    {option === "Other" && showOtherInput && (
                      <div className="ml-8 flex gap-3">
                        <input
                          type="text"
                          value={otherInputValue}
                          onChange={(e) => setOtherInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleOtherSubmit();
                            } else if (e.key === 'Escape') {
                              setShowOtherInput(false);
                              setOtherInputValue('');
                            }
                          }}
                          placeholder="Please specify..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#015AB8] focus:ring-1 focus:ring-[#015AB8]"
                          autoFocus
                        />
                        <button
                          onClick={handleOtherSubmit}
                          className="bg-[#015AB8] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#014a9f] transition-colors"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => {
                            setShowOtherInput(false);
                            setOtherInputValue('');
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="px-6 py-3 rounded-lg font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
              >
                Skip to Resources
              </button>
              
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => navigate('/resources')}
                  className="px-6 py-3 rounded-lg font-semibold bg-[#015AB8] text-white hover:bg-[#014a9f] transition-colors"
                >
                  View My Resources →
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    answers[currentQuestion.id]
                      ? 'bg-[#015AB8] text-white hover:bg-[#014a9f]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DecisionTree;