import React, { useState } from 'react'
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

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(null);

  // Filtering logic
  const filteredServices = React.useMemo(() => {
    if (!filters) return combinedServices;
    return combinedServices.filter(service => {
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
        !filters.cw || filters.cw.length === 0 || filters.cw.includes("CW") || filters.cw.includes(service.cw);

      return matchesSearch && matchesAge && matchesCounty && matchesInsurance && matchesCw;
    });
  }, [filters]);

  return (
    <div className="bg-[#f6f8ff] flex flex-col min-h-screen w-full relative overflow-x-hidden">
      {/* Header */}
      <div className="w-full">
        <Header />
      </div>

      {/* Search Panel */}
      <div className="w-full sm:px-2">
        <SearchPanel onSearch={setFilters} />
      </div>

      {/* Main content area with blur overlay when sidebarOpen */}
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