import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoadmapView from '../components/RoadmapView';
import { ArrowLeft, BrainCircuit } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-purple-500 animate-spin"></div>
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
