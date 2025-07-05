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
  const [showWelcome, setShowWelcome] = useState(true);

  // 6 comprehensive questions for better personalization
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
      tags: ["#system", "#affiliation", "#department", "#organization"]
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
        "Legal/Court Services",
        "Other"
      ],
      tags: ["#role", "#position", "#job-function", "#responsibility"]
    },
    {
      id: 3,
      category: "Resource Type",
      question: "What type of resources are you primarily looking for?",
      options: [
        "Services & Support Programs",
        "Placement Options",
        "Training & Technical Assistance",
        "Funding & Financial Support",
        "Assessment Tools",
        "Crisis Intervention",
        "Other"
      ],
      tags: ["#resources", "#services", "#placement", "#support", "#tools"]
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
        "Special Populations (LGBTQ+, CSEC, etc.)",
        "Other"
      ],
      tags: ["#population", "#age-groups", "#demographics", "#clients"]
    },
    {
      id: 5,
      category: "Geographic Scope",
      question: "What geographic area do you primarily serve?",
      options: [
        "Los Angeles County",
        "Sacramento County",
        "Alameda County",
        "San Diego County",
        "Orange County",
        "Multiple Counties",
        "Statewide",
        "Other"
      ],
      tags: ["#geography", "#county", "#location", "#service-area"]
    },
    {
      id: 6,
      category: "Complexity Level",
      question: "What level of complexity are you typically dealing with?",
      options: [
        "Basic/Standard Cases",
        "Moderate Complexity",
        "High Complexity/Multi-System",
        "Crisis Situations",
        "Cross-Jurisdictional Cases",
        "All Levels",
        "Other"
      ],
      tags: ["#complexity", "#case-level", "#multi-system", "#crisis"]
    }
  ];

  // Load saved answers from cookies on component mount
  useEffect(() => {
    const savedAnswers = getCookie('decisionTreeAnswers');
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers(savedAnswers);
      setShowWelcome(false);
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
    setShowWelcome(true);
  };

  // Start the questionnaire
  const startQuestionnaire = () => {
    setShowWelcome(false);
    setCurrentQuestionIndex(0);
  };

  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Welcome screen - always show first for new users
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f6f8ff] to-[#e2e4fb] flex flex-col">
        <Header />
        
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-5xl w-full text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12 mb-8 border border-[#015AB8]/10">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#015AB8] rounded-full mb-6">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16S28.84 4 20 4zm0 28c-6.62 0-12-5.38-12-12S13.38 8 20 8s12 5.38 12 12-5.38 12-12 12z" fill="white"/>
                    <path d="M18 14h4v12h-4zM18 10h4v2h-4z" fill="white"/>
                  </svg>
                </div>
                <h1 className="text-5xl font-bold text-[#015AB8] mb-6 leading-tight">
                  System of Care Coordination Tool
                </h1>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Welcome! This personalized decision tree will help you find the most relevant resources 
                  for your specific role, system, and needs. Complete 6 questions to get customized recommendations 
                  that match your professional context.
                </p>
              </div>
              
              {/* Enhanced Features Preview */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-[#015AB8] mb-6">What You'll Get:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#f8f9ff] p-6 rounded-xl border border-[#015AB8]/20">
                    <div className="w-12 h-12 bg-[#015AB8] rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-[#015AB8] mb-2">Personalized Results</h4>
                    <p className="text-gray-600 text-sm">Resources filtered specifically for your system and role</p>
                  </div>
                  <div className="bg-[#f8f9ff] p-6 rounded-xl border border-[#015AB8]/20">
                    <div className="w-12 h-12 bg-[#015AB8] rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-[#015AB8] mb-2">Smart Recommendations</h4>
                    <p className="text-gray-600 text-sm">AI-powered matching based on your specific needs</p>
                  </div>
                  <div className="bg-[#f8f9ff] p-6 rounded-xl border border-[#015AB8]/20">
                    <div className="w-12 h-12 bg-[#015AB8] rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2l2.09 6.26L20 9.27l-5 4.87 1.18 6.88L12 17.77l-4.18 3.25L9 14.14 4 9.27l5.91-1.01L12 2z" fill="white"/>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-[#015AB8] mb-2">Saved Preferences</h4>
                    <p className="text-gray-600 text-sm">Your answers are remembered for future visits</p>
                  </div>
                </div>
              </div>

              {/* Question Categories Preview */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-[#015AB8] mb-6">6 Quick Questions About:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {questions.map((q, index) => (
                    <div key={q.id} className="bg-[#E2E4FB] text-[#015AB8] px-4 py-3 rounded-xl text-sm font-medium border border-[#015AB8]/20">
                      <div className="font-semibold">{index + 1}. {q.category}</div>
                      <div className="text-xs mt-1 opacity-80">
                        {q.tags.slice(0, 2).join(' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={startQuestionnaire}
                  className="bg-[#015AB8] text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-[#014a9f] transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Personalization (6 Questions)
                </button>
                
                <button
                  onClick={handleSkip}
                  className="bg-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-400 transition-colors"
                >
                  Browse All Resources
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                ⏱️ Takes less than 2 minutes • 🔒 Your data stays private • 🎯 Get better results
              </p>
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
          {/* Enhanced Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-lg font-bold text-[#015AB8]">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="text-sm text-gray-600 mt-1">
                  {currentQuestion.category} • {Math.round(progress)}% Complete
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={resetAnswers}
                  className="text-sm text-[#CB3525] hover:text-[#b53e2f] font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Skip to Resources
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#015AB8] to-[#0066cc] h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Enhanced Question Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-[#015AB8]/20">
            <h3 className="text-lg font-semibold text-[#015AB8] mb-4 flex items-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-2">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="currentColor"/>
                <path d="M9 7h2v6H9zM9 5h2v1H9z" fill="white"/>
              </svg>
              Progress Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {questions.map((q, index) => (
                <div 
                  key={q.id} 
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    index === currentQuestionIndex 
                      ? 'border-[#015AB8] bg-[#E2E4FB] shadow-md transform scale-105' 
                      : answers[q.id] 
                        ? 'border-green-400 bg-green-50 shadow-sm' 
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {index + 1}. {q.category}
                    </span>
                    {answers[q.id] ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="9" fill="#10B981"/>
                        <path d="M6 9l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : index === currentQuestionIndex ? (
                      <div className="w-4 h-4 bg-[#015AB8] rounded-full animate-pulse"></div>
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                  {answers[q.id] && (
                    <div className="text-xs text-gray-600 truncate font-medium">
                      ✓ {answers[q.id]}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {q.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-[#015AB8]/20">
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-block bg-[#015AB8] text-white px-4 py-2 rounded-full text-sm font-bold">
                  {currentQuestion.category}
                </span>
                {currentQuestion.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 
                className="text-3xl font-bold text-[#333] leading-tight mb-4"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  lineHeight: '1.2'
                }}
              >
                {currentQuestion.question}
              </h2>
              <p className="text-gray-600">
                Select the option that best describes your situation. This helps us provide more relevant resources.
              </p>
            </div>

            {/* Enhanced Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option || 
                                 (option === "Other" && answers[currentQuestion.id]?.startsWith("Other:"));
                
                return (
                  <div key={index} className="space-y-3">
                    <button
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] ${
                        isSelected
                          ? 'bg-[#E2E4FB] border-[#015AB8] text-[#015AB8] shadow-lg'
                          : 'bg-white border-gray-200 hover:border-[#015AB8] hover:bg-[#f8f9ff] hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          isSelected 
                            ? 'border-[#015AB8] bg-[#015AB8]' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-lg font-semibold">
                          {option === "Other" && answers[currentQuestion.id]?.startsWith("Other:") 
                            ? answers[currentQuestion.id] 
                            : option}
                        </span>
                      </div>
                    </button>

                    {/* Enhanced Other Input */}
                    {option === "Other" && showOtherInput && (
                      <div className="ml-10 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Please specify your {currentQuestion.category.toLowerCase()}:
                        </label>
                        <div className="flex gap-3">
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
                            placeholder="Type your answer here..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#015AB8] focus:ring-2 focus:ring-[#015AB8]/20 text-lg"
                            autoFocus
                          />
                          <button
                            onClick={handleOtherSubmit}
                            disabled={!otherInputValue.trim()}
                            className="bg-[#015AB8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#014a9f] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => {
                              setShowOtherInput(false);
                              setOtherInputValue('');
                            }}
                            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400 transform hover:scale-105'
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-4">
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => navigate('/resources')}
                  disabled={!answers[currentQuestion.id]}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    answers[currentQuestion.id]
                      ? 'bg-[#015AB8] text-white hover:bg-[#014a9f] shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  🎯 View My Personalized Resources →
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    answers[currentQuestion.id]
                      ? 'bg-[#015AB8] text-white hover:bg-[#014a9f] shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              {currentQuestionIndex + 1} of {questions.length} questions completed • 
              {questions.length - currentQuestionIndex - 1} remaining
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DecisionTree;