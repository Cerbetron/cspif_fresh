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
  const [customQuestions, setCustomQuestions] = useState([]);
  const [showCustomization, setShowCustomization] = useState(false);

  // Default Decision Tree Questions
  const defaultQuestions = [
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
      ],
      required: true
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
      ],
      required: true
    },
    {
      id: 3,
      category: "Funnels",
      question: "If you would like child-specific resources, please select from the following resource choices, or if looking for general system information, go to the next question.",
      options: [
        "Services",
        "Placement options",
        "Skip to next question"
      ],
      required: false
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
      },
      required: false
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
      },
      required: false
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
      ],
      required: false
    }
  ];

  // Load saved answers and custom questions from cookies on component mount
  useEffect(() => {
    const savedAnswers = getCookie('decisionTreeAnswers');
    const savedCustomQuestions = getCookie('customDecisionTreeQuestions');
    
    if (savedAnswers) {
      setAnswers(savedAnswers);
    }
    
    if (savedCustomQuestions && savedCustomQuestions.length > 0) {
      setCustomQuestions(savedCustomQuestions);
    } else {
      setCustomQuestions(defaultQuestions);
    }
  }, []);

  // Get current question
  const getCurrentQuestion = () => {
    const visibleQuestions = customQuestions.filter(q => {
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
    const visibleQuestions = customQuestions.filter(q => {
      if (!q.showWhen) return true;
      return q.showWhen(answers);
    });

    if (currentQuestionIndex < visibleQuestions.length - 1) {
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

  // Save custom questions
  const saveCustomQuestions = (questions) => {
    setCustomQuestions(questions);
    setCookie('customDecisionTreeQuestions', questions);
    setShowCustomization(false);
  };

  // Reset to default questions
  const resetToDefault = () => {
    setCustomQuestions(defaultQuestions);
    setCookie('customDecisionTreeQuestions', defaultQuestions);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCookie('decisionTreeAnswers', {});
  };

  // Calculate progress
  const visibleQuestions = customQuestions.filter(q => {
    if (!q.showWhen) return true;
    return q.showWhen(answers);
  });
  const progress = visibleQuestions.length > 0 ? ((currentQuestionIndex + 1) / visibleQuestions.length) * 100 : 0;

  // Check if user has completed the decision tree before
  const hasCompletedBefore = Object.keys(answers).length > 0;

  // Welcome screen for first-time users
  if (!hasCompletedBefore && currentQuestionIndex === 0 && !currentQuestion) {
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
                Answer a few questions to get started with tailored recommendations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    setCustomQuestions(defaultQuestions);
                    setCurrentQuestionIndex(0);
                  }}
                  className="bg-[#015AB8] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#014a9f] transition-colors"
                >
                  Start Decision Tree
                </button>
                
                <button
                  onClick={() => setShowCustomization(true)}
                  className="bg-[#CB3525] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#b53e2f] transition-colors"
                >
                  Customize Questions
                </button>
                
                <button
                  onClick={handleSkip}
                  className="bg-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-400 transition-colors"
                >
                  Skip to Resources
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Question customization interface
  if (showCustomization) {
    return (
      <div className="min-h-screen bg-[#f6f8ff] flex flex-col">
        <Header />
        
        <div className="flex-1 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-[#015AB8]">Customize Decision Tree Questions</h2>
                <button
                  onClick={() => setShowCustomization(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <QuestionCustomizer 
                questions={customQuestions}
                onSave={saveCustomQuestions}
                onReset={resetToDefault}
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#f6f8ff] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Decision Tree Complete!</h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/resources')}
                className="bg-[#015AB8] text-white px-6 py-3 rounded-lg font-semibold mr-4"
              >
                View Personalized Resources
              </button>
              <button
                onClick={() => setShowCustomization(true)}
                className="bg-[#CB3525] text-white px-6 py-3 rounded-lg font-semibold"
              >
                Customize Questions
              </button>
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
                Question {currentQuestionIndex + 1} of {visibleQuestions.length}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[#015AB8]">
                  {Math.round(progress)}% Complete
                </span>
                <button
                  onClick={() => setShowCustomization(true)}
                  className="text-sm text-[#CB3525] hover:text-[#b53e2f] font-medium"
                >
                  Customize Questions
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

// Question Customizer Component
const QuestionCustomizer = ({ questions, onSave, onReset }) => {
  const [editableQuestions, setEditableQuestions] = useState(questions);

  const updateQuestion = (index, field, value) => {
    const updated = [...editableQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setEditableQuestions(updated);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...editableQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setEditableQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...editableQuestions];
    updated[questionIndex].options.push('New Option');
    setEditableQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...editableQuestions];
    updated[questionIndex].options.splice(optionIndex, 1);
    setEditableQuestions(updated);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Math.max(...editableQuestions.map(q => q.id)) + 1,
      category: "Custom",
      question: "New Question",
      options: ["Option 1", "Option 2"],
      required: false
    };
    setEditableQuestions([...editableQuestions, newQuestion]);
  };

  const removeQuestion = (index) => {
    const updated = editableQuestions.filter((_, i) => i !== index);
    setEditableQuestions(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Questions ({editableQuestions.length})</h3>
        <div className="space-x-3">
          <button
            onClick={addQuestion}
            className="bg-[#015AB8] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#014a9f] transition-colors"
          >
            Add Question
          </button>
          <button
            onClick={onReset}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {editableQuestions.map((question, qIndex) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={question.category}
                    onChange={(e) => updateQuestion(qIndex, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#015AB8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#015AB8]"
                    rows="2"
                  />
                </div>
              </div>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#015AB8]"
                    />
                    <button
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(qIndex)}
                  className="text-[#015AB8] hover:text-[#014a9f] text-sm font-medium"
                >
                  + Add Option
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={() => onSave(editableQuestions)}
          className="bg-[#015AB8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#014a9f] transition-colors"
        >
          Save Questions
        </button>
      </div>
    </div>
  );
};

export default DecisionTree;