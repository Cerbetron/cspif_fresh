import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

// Example options
const countyOptions = ["County", "Alameda", "Los Angeles", "Sacramento", "San Diego"];
const insuranceOptions = [
  "Insurance",                             
  "Private",
  "MediCal Managed Care",
  "MediCal FFS",
  "Other"
];
const cwOptions = ["Child Welfare", "Option 1", "Option 2", "Option 3"];

const filterChips = [
  "All",
  "Child Welfare (CW)",
  "Probation",
  "Behavioral Health (BH)",
  "Developmental Services",
  "Education"
];

const buttonTextStyle = {
  fontFamily: 'Open Sans, sans-serif',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '100%',
  letterSpacing: '0%',
  textTransform: 'capitalize'
};

// Custom dropdown using div/ul
const CustomDropdown = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Determine border color
  const borderColor = open ? "#005CB9" : "#bfc6ea";

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        className={`
          min-w-full rounded-xl bg-white
          flex justify-between items-center
          px-3 py-2 text-[14px] sm:text-[14px] md:text-[15px]
          focus:outline-none whitespace-nowrap min-h-[44px]
          transition-colors duration-150
        `}
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '100%',
          letterSpacing: '0%',
          textTransform: 'capitalize',
          border: `2px solid ${borderColor}`,
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{value}</span>
        <span className="ml-2 flex-shrink-0">
          <div className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <svg width="14" height="10" viewBox="0 0 24 16" fill="none">
              <polygon points="12,14 4,6 20,6" fill="#3B4A9F"/>
            </svg>
          </div>
        </span>
      </button>
      {open && (
        <ul
          className={`
            absolute left-0 mt-1 w-full bg-white border border-[#bfc6ea] rounded-xl shadow z-50
            text-[13px] sm:text-[14px] md:text-[15px]
            max-h-56 overflow-y-auto
          `}
        >
          {options.map((opt) => (
            <li
              key={opt}
              className={`
                px-3 py-2 cursor-pointer hover:bg-blue-100 transition
                ${opt === value ? "bg-blue-50 font-semibold" : ""}
              `}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SearchPanel = ({ onSearch }) => {
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [county, setCounty] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [cw, setCw] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const searchInputRef = useRef();

  // Decision Tree state
  const [decisionTreeOpen, setDecisionTreeOpen] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [decisionTreeAnswers, setDecisionTreeAnswers] = useState({});
  
  // Dialog state for "Other" option
  const [showOtherDialog, setShowOtherDialog] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [otherInputValue, setOtherInputValue] = useState('');

  // Decision Tree data
  const decisionTreeQuestions = [
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
        "Placement options"
      ],
      hasSubQuestions: true
    },
    {
      id: 3.1,
      parentId: 3,
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
      id: 3.2,
      parentId: 3,
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
      id: 4,
      category: "Funnels",
      question: "If you would like more information about system partner placements and services, please identify which system and which resource you would like to learn more about.",
      options: [
        "Child Welfare",
        "Behavioral Health (BH)",
        "Education",
        "Probation",
        "Regional center"
      ],
      hasSubQuestions: true
    },
    {
      id: 4.1,
      parentId: 4,
      question: "Would you like to know more about services and/or supports from the systems selected?",
      options: [
        "Services",
        "Placement options"
      ],
      showWhen: (answers) => {
        return answers[4] && answers[4] !== "";
      }
    }
  ];

  // Toggle decision tree visibility
  const toggleDecisionTree = () => {
    setDecisionTreeOpen(!decisionTreeOpen);
  };

  // Toggle question expansion
  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Handle answer selection - allow toggle functionality
  const handleAnswerSelect = (questionId, option) => {
    // If "Other" is selected, show inline input
    if (option === "Other") {
      setCurrentQuestionId(questionId);
      setOtherInputValue('');
      setDecisionTreeAnswers(prev => ({
        ...prev,
        [questionId]: option
      }));
      return;
    }

    setDecisionTreeAnswers(prev => {
      const currentAnswer = prev[questionId];
      
      // If the same option is clicked again, unselect it
      if (currentAnswer === option) {
        const newAnswers = { ...prev };
        delete newAnswers[questionId]; // Remove the answer completely
        return newAnswers;
      } else {
        // Otherwise, select the new option
        return {
          ...prev,
          [questionId]: option
        };
      }
    });
  };

  // Handle "Other" dialog submission
  const handleOtherSubmit = () => {
    if (otherInputValue.trim()) {
      setDecisionTreeAnswers(prev => ({
        ...prev,
        [currentQuestionId]: `Other: ${otherInputValue.trim()}`
      }));
    }
    setShowOtherDialog(false);
    setCurrentQuestionId(null);
    setOtherInputValue('');
  };

  // Handle "Other" dialog cancel
  const handleOtherCancel = () => {
    setShowOtherDialog(false);
    setCurrentQuestionId(null);
    setOtherInputValue('');
  };

  // Multi-select dropdown logic
  const handleMultiSelect = (current, setCurrent, option, defaultOption) => {
    if (option === defaultOption) {
      setCurrent([]);
    } else {
      setCurrent(prev =>
        prev.includes(option)
          ? prev.filter(v => v !== option)
          : [...prev.filter(v => v !== defaultOption), option]
      );
    }
  };

  // Call onSearch whenever filters change
  useEffect(() => {
    if (onSearch) {
      onSearch({
        search: searchInput,
        county,
        insurance,
        cw,
        selectedFilter: filterChips[selectedFilter]
      });
    }
    // eslint-disable-next-line
  }, [searchInput, county, insurance, cw, selectedFilter]);

  // Clear all filters and search
  const clearAll = () => {
    setSelectedFilter(0);
    setSearchInput('');
    setCounty([]);
    setInsurance([]);
    setCw([]);
  };

  // Multi-select dropdown component
  const MultiSelectDropdown = ({ options, value, setValue, defaultOption }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    useEffect(() => {
      const handleClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);
    const borderColor = open ? "#005CB9" : "#bfc6ea";
    return (
      <div ref={ref} className="relative flex-1">
        <button
          type="button"
          className={`
            min-w-full rounded-xl bg-white
            flex justify-between items-center
            px-3 py-2 text-[14px] sm:text-[14px] md:text-[15px]
            focus:outline-none whitespace-nowrap min-h-[44px]
            transition-colors duration-150
          `}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '100%',
            letterSpacing: '0%',
            textTransform: 'capitalize',
            border: `2px solid ${borderColor}`,
          }}
          onClick={() => setOpen(o => !o)}
        >
          <span className="truncate">
            {value.length === 0 ? defaultOption : value.join(', ')}
          </span>
          <span className="ml-2 flex-shrink-0">
            <div className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
              <svg width="14" height="10" viewBox="0 0 24 16" fill="none">
                <polygon points="12,14 4,6 20,6" fill="#3B4A9F"/>
              </svg>
            </div>
          </span>
        </button>
        {open && (
          <ul
            className={`
              absolute left-0 mt-1 w-full bg-white border border-[#bfc6ea] rounded-xl shadow z-50
              text-[13px] sm:text-[14px] md:text-[15px]
              max-h-56 overflow-y-auto
            `}
          >
            {options.map((opt) => (
              <li
                key={opt}
                className={`
                  flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-100 transition
                  border-b border-gray-100
                  ${value.includes(opt) ? "bg-blue-50 font-semibold" : ""}
                `}
                onClick={() => handleMultiSelect(value, setValue, opt, defaultOption)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value.includes(opt)}
                    readOnly
                    className="mr-2 w-5 h-5 accent-blue-500"
                  />
                  <span>{opt}</span>
                </div>
                {value.includes(opt) && (
                  <svg
                    className="text-blue-500"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <polyline
                      points="5 11 9 15 15 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Listen for any keydown event and focus the search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea already
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable
      ) {
        return;
      }
      // Only activate for visible characters (not ctrl, shift, etc.)
      if (e.key.length === 1) {
        setIsActive(true);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle filter selection
  const handleFilterSelect = (index) => {
    setSelectedFilter(index);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchInput('');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      // Optionally, you can call onSearch here if you want to trigger search on Enter
      // onSearch({ search: searchInput, age, county, insurance, cw, selectedFilter: filterChips[selectedFilter] });
      e.preventDefault();
    }
  };
  
  const partnerFullNames = {
    TAH: "Tribally Approved Home (TAH)",
    RFA: "Resource Family Approval (RFA)",
    CWS: "Child Welfare Services (CWS)",
    MHP: "Mental Health Plan (MHP)",
    ASAM: "American Society of Addiction Medicine (ASAM)",
  };

  // Decision Tree Component
  const DecisionTree = () => (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen mb-6">
      {/* Decision Tree Header */}
      <div 
        className="flex items-center justify-center p-4 cursor-pointer bg-[#E2E4FB] relative"
        onClick={toggleDecisionTree}
      >
        <h3 
          className="text-[#333]" 
          style={{ 
            fontFamily: 'Open Sans, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '100%',
            letterSpacing: '0%',
            textTransform: 'uppercase'
          }}
        >
          DECISION TREE
        </h3>
        <div className="ml-5">
          <div className={`transform transition-transform duration-200 ${decisionTreeOpen ? '' : 'rotate-180'}`}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.7852 19H10.1955C9.13619 19 8.5754 17.7102 9.38544 16.9731L15.2426 11.3225C15.7411 10.8925 16.4888 10.8925 16.925 11.3225L22.6576 16.9731C23.4053 17.7102 22.8445 19 21.7852 19Z" fill="#015AB8"/>
              <path d="M16 31C7.73077 31 1 24.2692 1 16C1 7.73077 7.73077 1 16 1C24.2692 1 31 7.73077 31 16C31 24.2692 24.2692 31 16 31ZM16 1.76923C8.15385 1.76923 1.76923 8.15385 1.76923 16C1.76923 23.8462 8.15385 30.2308 16 30.2308C23.8462 30.2308 30.2308 23.8462 30.2308 16C30.2308 8.15385 23.8462 1.76923 16 1.76923Z" fill="#015AB8"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Decision Tree Content */}
      {decisionTreeOpen && (
        <div className="bg-white px-6 py-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {decisionTreeQuestions
              .filter(q => {
                if (!q.parentId) return true;
                if (q.showWhen) return q.showWhen(decisionTreeAnswers);
                return true;
              })
              .map((q, index) => {
                const mainQuestions = decisionTreeQuestions.filter(question => !question.parentId);
                const questionNumber = q.parentId 
                  ? `${q.parentId}.${q.id.toString().split('.')[1]}` 
                  : mainQuestions.findIndex(mainQ => mainQ.id === q.id) + 1;
                
                return (
                  <div key={q.id} className={`${q.parentId ? 'ml-8' : ''}`}>
                    {/* Question Container - includes both header and options */}
                    <div 
                      className={`transition-all duration-200 ${
                        expandedQuestions[q.id] 
                          ? 'bg-[#E2E4FB] border-2 border-[#3B82F6] rounded-lg' 
                          : 'bg-transparent'
                      }`}
                    >
                      {/* Question Header */}
                      <div 
                        className="flex items-start justify-between p-4 cursor-pointer"
                        onClick={() => toggleQuestion(q.id)}
                      >
                        <div className="flex-1">
                          <span 
                            className="text-[#333]" 
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              fontWeight: 400,
                              fontSize: '18px',
                              lineHeight: '115%',
                              letterSpacing: '1%'
                            }}
                          >
                            {questionNumber}. {q.question}
                          </span>
                        </div>
                        <div className={`transform transition-transform duration-200 ml-4 flex-shrink-0 ${expandedQuestions[q.id] ? '' : 'rotate-180'}`}>
                          <svg width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 7.38086L8 -0.000279427L16 7.38086H0Z" fill="#3F5590"/>
                          </svg>
                        </div>
                      </div>

                      {/* Question Options - within the same container */}
                      {expandedQuestions[q.id] && (
                        <div className="px-4 pb-4">
                          <div className="flex flex-wrap gap-6">
                            {q.options.map((option, optionIndex) => {
                              const isSelected = decisionTreeAnswers[q.id] === option || 
                                                (option === "Other" && decisionTreeAnswers[q.id]?.startsWith("Other:"));
                              
                              return (
                                <div 
                                  key={optionIndex}
                                  className="flex items-center"
                                >
                                  <div 
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleAnswerSelect(q.id, option)}
                                  >
                                    {/* Radio button for all questions */}
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                                      isSelected 
                                        ? 'bg-white border-[#E53E3E]' 
                                        : 'bg-white border-[#CBD5E1]'
                                    }`}>
                                      {/* Grey dot when not selected, red dot when selected */}
                                      <div className={`w-3 h-3 rounded-full ${
                                        isSelected 
                                          ? 'bg-[#E53E3E]' 
                                          : 'bg-[#CBD5E1]'
                                      }`}>
                                      </div>
                                    </div>
                                    <span className="text-[15px] text-[#333] select-none" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                                      {option === "Other" && decisionTreeAnswers[q.id]?.startsWith("Other:") 
                                        ? decisionTreeAnswers[q.id] 
                                        : option}
                                    </span>
                                  </div>
                                  
                                  {/* Inline input for "Other" option */}
                                  {option === "Other" && isSelected && (
                                    <input
                                      type="text"
                                      value={otherInputValue}
                                      onChange={(e) => setOtherInputValue(e.target.value)}
                                      onBlur={handleOtherSubmit}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleOtherSubmit();
                                        } else if (e.key === 'Escape') {
                                          handleOtherCancel();
                                        }
                                      }}
                                      placeholder="Specify..."
                                      className="ml-3 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-screen flex flex-col items-center bg-[#f6f8ff] py-6 border border-blue-200 rounded-b-lg px-4">
      {/* Description */}
      <div
        className="w-full md:w-[80%] mx-auto text-xs text-gray-700 mb-4 px-4 md:text-center sm:text-justify"
        style={{
          fontFamily: "Open Sans, sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "115%",
          letterSpacing: "1%",
          textAlign: "center",
        }}
      >
        CBSI activates CFPIC's vision to support AB 2083 Children, Youth & Families System of Care (CYFSOC) leadership by helping them advance their partnerships across all child and family serving systems, at every level. The goals of CBSI are to enhance the care continuum for children and youth, and particularly those with complex care needs and who are involved in multiple systems.
      </div>

      {/* Decision Tree */}
      <div className="w-full md:w-[80%] mb-4">
        <DecisionTree />
      </div>

      {/* Filters */}
      <div className="md:w-[80%] bg-[#f6f8ff] rounded-xl p-4 shadow flex flex-col gap-3 sm:w-full">
        {/* Dropdowns - remove Age dropdown */}
        <div className="flex gap-4 w-full flex-col sm:flex-row">
          <MultiSelectDropdown options={countyOptions} value={county} setValue={setCounty} defaultOption="County" />
          <MultiSelectDropdown options={insuranceOptions} value={insurance} setValue={setInsurance} defaultOption="Insurance" />
          <MultiSelectDropdown options={cwOptions} value={cw} setValue={setCw} defaultOption="Child Welfare" />
        </div>
        
        {/* Search Bar */}
        <div className={`flex items-center rounded-lg px-4 py-4 bg-white transition-all duration-150
          ${isActive ? "border-[#005CB9]" : "border-[#B7B9EA]"}
        `}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
        }}>
          <FaSearch className="text-gray-400 mr-2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            className={`flex-1 bg-white outline-none border-none shadow-none focus:ring-0 text-gray-700 transition-all duration-150`}
            style={{ boxShadow: "none" }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setIsActive(true)}
            onBlur={() => setIsActive(false)}
          />
          {searchInput && (
            <button onClick={clearSearch}>
              <IoMdClose className="text-gray-400 text-lg" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-1 pb-2">
          {filterChips.map((chip, idx) => (
            <button
              key={chip}
              style={buttonTextStyle}
              onClick={() => handleFilterSelect(idx)}
              className={`px-3 py-2 rounded-xl border-2 font-medium whitespace-nowrap transition-colors duration-150
                ${idx === selectedFilter
                  ? 'bg-[#D14B3A] text-white border-[#D14B3A]'
                  : 'bg-white text-[#222] border-[#E8ECFF] hover:bg-white hover:border-gray-300'
                }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All Button moved outside */}
      <div className="w-[100%] sm:w-[80%] flex justify-end mt-2 ">
        <button
          onClick={clearAll}
          style={buttonTextStyle}
          className="bg-[#3eb6e0] text-white px-4 py-2 rounded-xl text-sm"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default SearchPanel;