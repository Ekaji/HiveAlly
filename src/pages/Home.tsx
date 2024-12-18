import { Link } from 'react-router-dom';
import { Search, MapPin, Filter,  Users, Building2, ArrowRight, Home as MyHome } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import spaceTypes from '../data/searchFilters.json'
// import Gallery from '../components/gallery';
import ResponsiveGrid from '../components/ResponsiveGrid';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export default function Home() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState<{ icon: JSX.Element; name: string; types: string[]; }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    LivingSpaces: [
      {
        type: "Private Rooms",
        description: "Individual rooms within shared apartments or houses."
      }
    ],
    location: ''
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { 
      icon: <MyHome />, 
      name: "Living Spaces", 
      types: ["Private Rooms", "Shared Apartments", "Entire Houses"] 
    },
    { 
      icon: <Building2 />, 
      name: "Office Spaces", 
      types: ["Coworking", "Private Offices", "Meeting Rooms"] 
    },
    { 
      icon: <Users />, 
      name: "Shared Rentals", 
      types: ["Market Stalls", "Event Spaces", "Storage Areas"] 
    }
  ];

  const handleFilterChange = (category: any, type: string) => {
    setFilters((prev: any) => ({
      ...prev,
      LivingSpaces: [{ type, description: spaceTypes.LivingSpaces.find(t => t.type === type)?.description }]
    }));
  };
        return (
          <section>
            {/* <Navbar /> */}
            <div className="bg-white border-t-4 border-black">
              <div className="relative px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-10">
                  <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-black sm:text-6xl">
                      Share Your Space, Earn Together
                    </h1>
                    <p className="mt-6 text-xl font-medium text-black">
                      Discover flexible spaces for every need – from rooms to offices to market stalls.
                    </p>
                    {!user ? (
                      <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                          to="/login"
                          className="inline-flex items-center px-6 py-3 bg-red-300 border-4 border-black text-lg font-bold text-black hover:bg-black hover:text-red-300 transition-colors"
                        >
                          Get started
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                          to="/register"
                          className="text-lg font-bold text-black underline hover:no-underline"
                        >
                          Create an account <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
          </div>

    
      <section className='py-20'>
      <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center bg-white rounded-full p-2 shadow-lg">
            <MapPin className="ml-4" />
            <input 
              type="text" 
              placeholder="Search by location" 
              className="flex-grow p-2 rounded-full focus:outline-none"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
            />
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="mx-2 "
            >
              <Filter />
            </button>
            <button 
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-opacity-90"
            >
              <Search />
            </button>
          </div>

          {isFilterOpen && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg p-4 z-10">
              <h4 className="font-bold mb-2">Filter Space Types</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(spaceTypes).map(([category, types]) => (
                  <div key={category}>
                    <h5 className="text-[#B0BEC5] font-semibold mb-2">{category}</h5>
                    {types.map(type => (
                      <label key={type.type} className="block">
                        <input 
                          type="radio" 
                          name={category}
                          value={type.type}
                          checked={filters.LivingSpaces[0]?.type === type.type}
                          onChange={() => handleFilterChange(category, type.type)}
                          className="mr-2"
                        />
                        {type.type}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section> 
            {/* Space Categories */}
      <section className="flex flex-col items-center w-full hidden" >
          <div className=" w-10/12">
            <div className="container mx-auto py-16">
              <h3 className="text-3xl font-bold text-center mb-8 ">Explore Space Categories</h3>
              <div className="grid grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-all cursor-pointer"
                    // onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex justify-center mb-4">
                      {category.icon}
                    </div>
                    <h4 className="text-xl font-semibold mb-4">{category.name}</h4>
                    <ul className="text-[#B0BEC5]">
                      {category.types.map((type, typeIndex) => (
                        <li key={typeIndex}>{type}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className=" bg-opacity-20 py-16">
              <div className="container mx-auto text-center">
                <h3 className="text-3xl font-bold mb-8 ">How HiveAlly Works</h3>
                <div className="grid grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold mb-4">List Your Space</h4>
                    <p className="text-[#B0BEC5]">Upload details about your available space quickly and easily</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold mb-4">Connect</h4>
                    <p className="text-[#B0BEC5]">Match with potential renters or sharers who fit your needs</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold mb-4">Earn & Share</h4>
                    <p className="text-[#B0BEC5]">Maximize your space's potential and generate additional income</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
      {/* <Gallery /> */}
      <ResponsiveGrid />
    </section>
  );
}
