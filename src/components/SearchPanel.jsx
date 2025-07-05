import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

// Example options
const countyOptions = ["County", "Alameda", "Los Angeles", "Sacramento", "San Diego", "Orange", "San Francisco"];
const insuranceOptions = [
  "Insurance",                             
  "Private",
  "MediCal Managed Care",
  "MediCal FFS",
  "Other"
];
const cwOptions = ["Child Welfare", "CWS", "Probation", "Mental Health", "Education", "Regional Center"];

const filterChips = [
  "All",
  "Child Welfare (CW)",
  "Probation",
  "Behavioral Health (BH)",
  "Developmental Services",
  "Education",
  "Crisis Services",
  "Placement Options",
  "Support Services"
];

const buttonTextStyle = {
  fontFamily: 'Open Sans, sans-serif',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '100%',
  letterSpacing: '0%',
  textTransform: 'capitalize'
};

const SearchPanel = ({ onSearch }) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [county, setCounty] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [cw, setCw] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const searchInputRef = useRef();

  // Cookie utilities
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

  // Load saved decision tree answers
  const [userPreferences, setUserPreferences] = useState(null);
  useEffect(() => {
    const savedAnswers = getCookie('decisionTreeAnswers');
    if (savedAnswers) {
      setUserPreferences(savedAnswers);
    }
  }, []);

  // Navigate to decision tree
  const goToDecisionTree = (e) => {
    e.preventDefault();
    navigate('/decision-tree');
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
      e.preventDefault();
    }
  };

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

      {/* Decision Tree Quick Access */}
      <div className="w-full md:w-[80%] mb-4">
        <div className="bg-white rounded-xl border-2 border-[#015AB8] p-6 text-center">
          <h3 className="text-xl font-semibold text-[#015AB8] mb-3">
            🎯 Get Personalized Resources
          </h3>
          <p className="text-gray-600 mb-4">
            Complete the 6-question decision tree to get resources tailored specifically to your system, role, and needs.
          </p>
          
          {/* Enhanced Quick Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <span className="bg-[#E2E4FB] text-[#015AB8] px-3 py-1 rounded-full text-sm font-medium">
              #system-affiliation
            </span>
            <span className="bg-[#E2E4FB] text-[#015AB8] px-3 py-1 rounded-full text-sm font-medium">
              #professional-role
            </span>
            <span className="bg-[#E2E4FB] text-[#015AB8] px-3 py-1 rounded-full text-sm font-medium">
              #resource-type
            </span>
            <span className="bg-[#E2E4FB] text-[#015AB8] px-3 py-1 rounded-full text-sm font-medium">
              #target-population
            </span>
            <span className="bg-[#E2E4FB] text-[#015AB8] px-3 py-1 rounded-full text-sm font-medium">
              #geographic-scope
            </span>
            <span className="bg-[#E2E4FB] text-[#015AB8] px-3 py-1 rounded-full text-sm font-medium">
              #complexity-level
            </span>
          </div>

          <button
            onClick={goToDecisionTree}
            className="bg-[#015AB8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#014a9f] transition-colors cursor-pointer"
            style={{ border: 'none', outline: 'none' }}
          >
            {userPreferences ? 'Update My Preferences (6 Questions)' : 'Start Decision Tree (6 Questions)'}
          </button>
          
          {userPreferences && (
            <p className="text-sm text-green-600 mt-2">
              ✓ You have personalized preferences active
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="md:w-[80%] bg-[#f6f8ff] rounded-xl p-4 shadow flex flex-col gap-3 sm:w-full">
        {/* Dropdowns */}
        <div className="flex gap-4 w-full flex-col sm:flex-row">
          <MultiSelectDropdown options={countyOptions} value={county} setValue={setCounty} defaultOption="County" />
          <MultiSelectDropdown options={insuranceOptions} value={insurance} setValue={setInsurance} defaultOption="Insurance" />
          <MultiSelectDropdown options={cwOptions} value={cw} setValue={setCw} defaultOption="System" />
        </div>
        
        {/* Enhanced Search Bar */}
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
            placeholder="Search resources, services, placements, programs..."
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

        {/* Enhanced Filter Chips with More Navigation Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-1 pb-2">
          {filterChips.map((chip, idx) => (
            <button
              key={chip}
              style={buttonTextStyle}
              onClick={() => handleFilterSelect(idx)}
              className={`px-3 py-2 rounded-xl border-2 font-medium whitespace-nowrap transition-colors duration-150 relative
                ${idx === selectedFilter
                  ? 'bg-[#D14B3A] text-white border-[#D14B3A]'
                  : 'bg-white text-[#222] border-[#E8ECFF] hover:bg-white hover:border-gray-300'
                }`}
            >
              {chip}
              {/* Enhanced Navigation tags */}
              <span className="sr-only">
                {chip === "Child Welfare (CW)" && "#child-welfare #cws #foster-care #family-services #rfa #tah"}
                {chip === "Probation" && "#probation #juvenile-justice #court #supervision #detention"}
                {chip === "Behavioral Health (BH)" && "#mental-health #behavioral-health #therapy #counseling #crisis"}
                {chip === "Developmental Services" && "#developmental #regional-center #disabilities #special-needs #autism"}
                {chip === "Education" && "#education #school #special-education #academic-support #iep"}
                {chip === "Crisis Services" && "#crisis #emergency #urgent #intervention #stabilization"}
                {chip === "Placement Options" && "#placement #residential #group-home #foster #housing"}
                {chip === "Support Services" && "#support #assistance #resources #programs #services"}
              </span>
            </button>
          ))}
        </div>

        {/* Enhanced Navigation Tags */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: '#placement', search: 'placement' },
              { label: '#services', search: 'services' },
              { label: '#support', search: 'support' },
              { label: '#youth', search: 'youth' },
              { label: '#family', search: 'family' },
              { label: '#crisis', search: 'crisis' },
              { label: '#rfa', search: 'rfa' },
              { label: '#tah', search: 'tah' },
              { label: '#wrap', search: 'wrap' },
              { label: '#cft', search: 'cft' },
              { label: '#isfc', search: 'isfc' },
              { label: '#respite', search: 'respite' }
            ].map((tag, index) => (
              <button 
                key={index}
                onClick={() => setSearchInput(tag.search)}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear All Button */}
      <div className="w-[100%] sm:w-[80%] flex justify-end mt-2 ">
        <button
          onClick={clearAll}
          style={buttonTextStyle}
          className="bg-[#3eb6e0] text-white px-4 py-2 rounded-xl text-sm"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default SearchPanel;