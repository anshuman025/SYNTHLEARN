import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoadmapView from '../components/RoadmapView';
import { ArrowLeft, BrainCircuit } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function RoadmapPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(location.state?.roadmap || null);
  const [isLoading, setIsLoading] = useState(!roadmap);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roadmap) {
      const fetchRoadmap = async () => {
        try {
          const { data } = await axios.get(`${API_URL}/roadmaps/${id}`);
          setRoadmap(data);
        } catch (err) {
          setError('Failed to load roadmap.');
        } finally {
          setIsLoading(false);
        }
      };
      
      // If it's the mock ID, we don't try to fetch again because it doesn't exist on server
      if (id !== 'mock-id') {
        fetchRoadmap();
      } else {
        setIsLoading(false);
      }
    }
  }, [id, roadmap]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] overflow-hidden">
        {/* Navbar overlay Skeleton */}
        <nav className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
          <div className="w-24 h-6 bg-white/5 rounded-md animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 animate-pulse"></div>
            <div className="w-32 h-6 bg-white/5 rounded-md animate-pulse"></div>
          </div>
          <div className="w-[100px]"></div>
        </nav>

        {/* Main Skeleton Roadmap Area */}
        <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto relative z-10">
          <div className="mb-12 text-center flex flex-col items-center">
            <div className="w-64 h-12 bg-white/10 rounded-xl animate-pulse mb-6"></div>
            <div className="w-full max-w-xl h-4 bg-white/5 rounded-md animate-pulse mb-2"></div>
            <div className="w-3/4 max-w-lg h-4 bg-white/5 rounded-md animate-pulse"></div>
          </div>
          
          <div className="w-full">
            {/* Skeleton Progress Bar */}
            <div className="mb-12 sticky top-24 z-20 bg-[#0A0A0A]/90 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <div className="w-32 h-4 bg-white/5 rounded-md animate-pulse"></div>
                <div className="w-12 h-4 bg-white/5 rounded-md animate-pulse"></div>
              </div>
              <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden"></div>
            </div>

            <div className="relative pl-4 md:pl-0">
               {/* Skeleton Vertical Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500/10 via-blue-500/10 to-transparent -translate-x-1/2"></div>
              
              {[1, 2, 3].map((item, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={item} className={`relative mb-12 md:flex w-full items-center justify-between ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                    <div className="absolute left-8 md:left-1/2 w-8 h-8 rounded-full bg-[#0A0A0A] border-4 border-neutral-800 -translate-x-1/2 z-10"></div>
                    <div className="hidden md:block md:w-5/12"></div>
                    <div className={`ml-14 md:ml-0 md:w-5/12 ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                       <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 h-40 flex flex-col justify-center">
                          <div className={`flex flex-col gap-3 ${isLeft ? 'items-start md:items-end' : 'items-start'}`}>
                            <div className="w-16 h-4 bg-purple-500/20 rounded-md animate-pulse"></div>
                            <div className="w-3/4 h-6 bg-white/10 rounded-md animate-pulse"></div>
                            <div className="w-24 h-4 bg-white/5 rounded-md animate-pulse mt-2"></div>
                          </div>
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-red-500 p-6">
        <p>{error || 'Roadmap not found.'}</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 flex items-center gap-2 text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Navbar overlay */}
      <nav className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:block">Back to Search</span>
        </button>
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
          <BrainCircuit className="w-6 h-6 text-purple-500" />
          <span>SYNTH<span className="text-purple-500">LEARN</span></span>
        </div>
        <div className="w-[100px]"></div> {/* Spacer for centering */}
      </nav>

      {/* Main Roadmap Area */}
      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {roadmap.topic}
          </h1>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Your personalized learning path, powered by Gemini 1.5. Progress step-by-step through the theory and practical resources.
          </p>
        </div>
        <RoadmapView roadmap={roadmap} setRoadmap={setRoadmap} />
      </main>
    </div>
  );
}
