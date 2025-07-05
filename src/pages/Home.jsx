import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import SearchPanel from '../components/SearchPanel'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import ResourceListing from '../components/ResourceListing'
import SidebarButton from '../components/SidebarButton'

// Import all service arrays
import {
  allServices,
  childWelfareServices,
  probationServices,
  probationPlacements,
  behavioralHealthPlacements
} from '../data/allServices'

// Combine all arrays into one master array
const combinedServices = [
  ...behavioralHealthPlacements,
  ...probationPlacements,
  ...probationServices,
  ...childWelfareServices,
  ...allServices
];

// Cookie utility
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

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);

  // Load user preferences from cookies
  useEffect(() => {
    const savedAnswers = getCookie('decisionTreeAnswers');
    if (savedAnswers) {
      setUserPreferences(savedAnswers);
    }
  }, []);

  // Filtering logic with personalization
  const filteredServices = React.useMemo(() => {
    let services = combinedServices;

    // Apply personalization based on decision tree answers
    if (userPreferences) {
      // Filter based on user's system affiliation
      if (userPreferences[1]) {
        const systemMapping = {
          "Child Welfare Services (CWS)": ["CWS", "Child Welfare"],
          "Behavioral Health (BH)": ["Mental Health", "BH"],
          "Probation": ["Probation"],
          "Education": ["Education"],
          "Regional center": ["Regional Center"]
        };
        
        const userSystem = userPreferences[1];
        if (systemMapping[userSystem]) {
          services = services.filter(service => 
            systemMapping[userSystem].some(system => 
              service.cw?.includes(system) || 
              service.partners?.some(partner => partner.includes(system))
            )
          );
        }
      }

      // Filter based on resource type preference
      if (userPreferences[3] === "Services") {
        services = services.filter(service => 
          !service.title.toLowerCase().includes('placement') &&
          !service.title.toLowerCase().includes('home') &&
          !service.title.toLowerCase().includes('facility')
        );
      } else if (userPreferences[3] === "Placement options") {
        services = services.filter(service => 
          service.title.toLowerCase().includes('placement') ||
          service.title.toLowerCase().includes('home') ||
          service.title.toLowerCase().includes('facility') ||
          service.title.toLowerCase().includes('rfa') ||
          service.title.toLowerCase().includes('tah')
        );
      }
    }

    // Apply search and filter criteria
    if (!filters) return services;
    
    return services.filter(service => {
      // Search filter (case-insensitive, matches title or description)
      const search = filters.search?.trim().toLowerCase() || '';
      const matchesSearch =
        !search ||
        service.title.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search);

      // Multi-select filters
      const matchesAge =
        !filters.age || filters.age.length === 0 || filters.age.includes("Age") || filters.age.includes(service.age);
      const matchesCounty =
        !filters.county || filters.county.length === 0 || filters.county.includes("County") || filters.county.includes(service.county);
      const matchesInsurance =
        !filters.insurance || filters.insurance.length === 0 || filters.insurance.includes("Insurance") || filters.insurance.includes(service.insurance);
      const matchesCw =
        !filters.cw || filters.cw.length === 0 || filters.cw.includes("Child Welfare") || filters.cw.includes(service.cw);

      return matchesSearch && matchesAge && matchesCounty && matchesInsurance && matchesCw;
    });
  }, [filters, userPreferences]);

  return (
    <div className="bg-[#f6f8ff] flex flex-col min-h-screen w-full relative overflow-x-hidden">
      {/* Header */}
      <div className="w-full">
        <Header />
      </div>

      {/* Personalization Banner */}
      {userPreferences && (
        <div className="w-full bg-[#E2E4FB] border-b border-[#015AB8] py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-2">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="#015AB8"/>
                <path d="M9 7h2v6H9zM9 5h2v1H9z" fill="#015AB8"/>
              </svg>
              <span className="text-[#015AB8] font-medium">
                Resources personalized based on your preferences
                {userPreferences[1] && ` for ${userPreferences[1]}`}
              </span>
            </div>
            <button
              onClick={() => {
                document.cookie = 'decisionTreeAnswers=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                setUserPreferences(null);
                window.location.reload();
              }}
              className="text-[#015AB8] hover:text-[#014a9f] font-medium text-sm"
            >
              Reset Preferences
            </button>
          </div>
        </div>
      )}

      {/* Search Panel */}
      <div className="w-full sm:px-2">
        <SearchPanel onSearch={setFilters} />
      </div>

      {/* Main content area */}
      <div className="relative w-full flex-1 px">
        {/* Resource Listing */}
        <div className="relative flex-1 flex flex-col w-full overflow-x-auto overflow-y-hidden">
          <div className={sidebarOpen ? "transition-all duration-300 relative z-10" : ""}>
            <ResourceListing services={filteredServices} />
          </div>
        </div>
      </div>

      <div className="flex min-w-full">
        <Footer />
      </div>
    </div>
  )
}

export default Home