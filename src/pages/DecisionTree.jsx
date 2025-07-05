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

  // Decision Tree Questions
  const questions = [
    {
      id: 1,
      category: "Demographic",
      question: "What system are you affiliated with?",
      options: [
        "Child Welfare Services (CWS)",
        "Behavioral Health (BH)",
        "Education",
        "Probation",
        "Regional center",
        "Community partner",
        "Other"
      ]
    },
    {
      id: 2,
      category: "Demographic",
      question: "What role do you most closely identify with?",
      options: [
        "Direct Services",
        "Leadership/Management",
        "Fiscal",
        "Other"
      ]
    },
    {
      id: 3,
      category: "Funnels",
      question: "If you would like child-specific resources, please select from the following resource choices, or if looking for general system information, go to the next question.",
      options: [
        "Services",
        "Placement options",
        "Skip to next question"
      ]
    },
    {
      id: 4,
      category: "Funnels",
      question: "What systems already serve the youth, or what systems would the youth be eligible for?",
      options: [
        "Child Welfare Services (CWS)",
        "Behavioral Health (BH)",
        "Regional Center",
        "Probation",
        "Education"
      ],
      showWhen: (answers) => {
        return answers[3] === "Services" || answers[3] === "Placement options";
      }
    },
    {
      id: 5,
      category: "Funnels",
      question: "What complex needs does the youth have?",
      options: [
        "Developmental needs",
        "Behavioral health needs",
        "Education needs",
        "Substance use disorder(s)",
        "CSEC",
        "Placement disruption"
      ],
      showWhen: (answers) => {
        return answers[3] === "Services" || answers[3] === "Placement options";
      }
    },
    {
      id: 6,
      category: "Funnels",
      question: "If you would like more information about system partner placements and services, please identify which system and which resource you would like to learn more about.",
      options: [
        "Child Welfare",
        "Behavioral Health (BH)",
        "Education",
        "Probation",
        "Regional center"
      ]
    },
    {
      id: 7,
      category: "Funnels",
      question: "Would you like to know more about services and/or supports from the systems selected?",
      options: [
        "Services",
        "Placement options"
      ],
      showWhen: (answers) => {
        return answers[6] && answers[6] !== "";
      }
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
  const getCurrentQuestion = () => {
    const visibleQuestions = questions.filter(q => {
      if (!q.showWhen) return true;
      return q.showWhen(answers);
    });
    return visibleQuestions[currentQuestionIndex];
  };

  const currentQuestion = getCurrentQuestion();

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
    const visibleQuestions = questions.filter(q => {
      if (!q.showWhen) return true;
      return q.showWhen(answers);
    });

    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Decision tree complete, navigate to main page
      navigate('/');
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Skip to main page
  const handleSkip = () => {
    navigate('/');
  };

  // Calculate progress
  const visibleQuestions = questions.filter(q => {
    if (!q.showWhen) return true;
    return q.showWhen(answers);
  });
  const progress = ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#f6f8ff] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Decision Tree Complete!</h2>
            <button
              onClick={() => navigate('/')}
              className="bg-[#015AB8] text-white px-6 py-3 rounded-lg font-semibold"
            >
              View Resources
            </button>
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
                Question {currentQuestionIndex + 1} of {visibleQuestions.length}
              </span>
              <span className="text-sm font-medium text-[#015AB8]">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#015AB8] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <span className="inline-block bg-[#E2E4FB] text-[#015AB8] px-3 py-1 rounded-full text-sm font-medium mb-4">
                {currentQuestion.category}
              </span>
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
              Previous
            </button>

            <button
              onClick={handleSkip}
              className="px-6 py-3 rounded-lg font-semibold bg-[#CB3525] text-white hover:bg-[#b53e2f] transition-colors"
            >
              Skip to Resources
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DecisionTree;