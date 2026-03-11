import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, BrainCircuit, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LandingPage() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/roadmaps/generate`, { topic });
      // navigate to the roadmap page once it's created
      if (data && data.id) {
        navigate(`/roadmap/${data.id}`, { state: { roadmap: data } });
      }
    } catch (error) {
      console.error('Failed to generate roadmap', error);
      // Fallback for UI testing before DB is hooked up
      navigate('/roadmap/mock-id', { state: { 
        roadmap: {
          id: 'mock-id',
          topic: topic,
          steps: [
             { id: '1', title: 'Introduction to ' + topic, theory: 'This is the basic theory.', estimated_time: '1 hour', youtube_query: topic + ' basics', order: 1, is_completed: false }
          ]
        }
      }});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0A0A0A]">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      {/* Navbar */}
      <nav className="relative z-10 p-6 flex items-center justify-between mx-auto w-full max-w-7xl">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
          <BrainCircuit className="w-6 h-6 text-purple-500" />
          <span>SYNTH<span className="text-purple-500">LEARN</span></span>
        </div>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium">
          GitHub
        </a>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-8">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Learning Architect</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
            Master anything, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">systematically.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Enter any topic and let our AI instantly generate a personalized, step-by-step roadmap complete with deep theory and curated video resources.
          </p>

          <form onSubmit={handleGenerate} className="relative group max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-neutral-900 border border-white/10 rounded-2xl p-2 shadow-2xl transition-all focus-within:border-purple-500/50">
              <BookOpen className="w-6 h-6 text-neutral-500 ml-4 hidden sm:block" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to learn today? (e.g. Advanced System Design)"
                className="w-full bg-transparent border-none outline-none text-white px-4 py-3 sm:py-4 placeholder-neutral-500 font-medium"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 sm:py-4 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Generate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left border-t border-white/5 pt-12">
            {[
              { title: "Deep AI Theory", desc: "Structured markdown explanations generated by Gemini 1.5 Flash." },
              { title: "Curated Videos", desc: "Automatic YouTube integrations fetching the most relevant tutorials." },
              { title: "Progress Tracking", desc: "Interactive timeline that saves your learning progress persistently." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </main>
    </div>
  );
}
