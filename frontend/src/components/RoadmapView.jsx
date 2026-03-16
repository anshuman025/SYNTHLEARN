import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Youtube, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function RoadmapView({ roadmap, setRoadmap }) {
  const steps = roadmap.steps || [];
  
  // Track open step, default to step 1
  const [openStepId, setOpenStepId] = useState(steps.length > 0 ? steps[0].id : null);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleComplete = async (e, step) => {
    e.stopPropagation(); // prevent opening/closing the accordion
    if (isUpdating || roadmap.id === 'mock-id') return; // mock id means DB is not hooked up yet
    setIsUpdating(true);
    try {
      const newStatus = !step.is_completed;
      // Optimistic update
      const updatedSteps = steps.map(s => s.id === step.id ? { ...s, is_completed: newStatus } : s);
      setRoadmap(prev => ({ ...prev, steps: updatedSteps }));
      
      await axios.put(`${API_URL}/roadmaps/${roadmap.id}/steps/${step.id}`, {
        is_completed: newStatus
      });
      // Optionally move to next step automatically if checking off
      if (newStatus) {
        const nextStep = steps.find(s => s.order === step.order + 1);
        if (nextStep) setOpenStepId(nextStep.id);
      }
    } catch (error) {
      console.error('Failed to update status', error);
      // Revert on error
      const revertedSteps = steps.map(s => s.id === step.id ? { ...s, is_completed: step.is_completed } : s);
      setRoadmap(prev => ({ ...prev, steps: revertedSteps }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate Progress
  const completedCount = steps.filter(s => s.is_completed).length;
  const progressPercent = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-12 sticky top-24 z-20 bg-[#0A0A0A]/90 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
        <div className="flex justify-between items-center mb-2 text-sm font-medium text-neutral-300">
          <span>Overall Progress</span>
          <span className="text-purple-400">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full relative"
          >
             <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
          </motion.div>
        </div>
      </div>

      <div className="relative pl-4 md:pl-0">
        {/* Vertical Line for Timeline */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500/20 via-blue-500/20 to-transparent -translate-x-1/2"></div>
        
        {steps.map((step, index) => {
          const isOpen = openStepId === step.id;
          const isLeft = index % 2 === 0;

          return (
            <motion.div 
               key={step.id}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.5, delay: index * 0.1 }}
               className={`relative mb-12 md:flex w-full items-center justify-between ${isLeft ? 'md:flex-row-reverse' : ''}`}
            >
              
              {/* Timeline Dot */}
              <div 
                onClick={() => setOpenStepId(isOpen ? null : step.id)}
                className="absolute left-8 md:left-1/2 w-8 h-8 rounded-full bg-[#0A0A0A] border-4 border-neutral-800 -translate-x-1/2 flex items-center justify-center z-10 transition-all duration-300 hover:scale-125 cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
                style={{ borderColor: step.is_completed ? '#a855f7' : '#262626' }}
              >
                {step.is_completed && <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)]"></div>}
              </div>

              {/* Empty space for alternating layout */}
              <div className="hidden md:block md:w-5/12"></div>

              {/* Card */}
              <div className={`ml-14 md:ml-0 md:w-5/12 ${isLeft ? 'md:pr-8 text-left md:text-right' : 'md:pl-8 text-left'}`}>
                <div 
                  onClick={() => setOpenStepId(isOpen ? null : step.id)}
                  className={`bg-neutral-900/80 backdrop-blur-xl border ${isOpen ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-white/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5 hover:shadow-xl hover:-translate-y-1'} rounded-2xl p-6 cursor-pointer transition-all duration-300 group`}
                >
                  <div className={`flex items-start justify-between gap-4 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                    <div className={`flex-1 ${isLeft ? 'md:text-right text-left' : 'text-left'}`}>
                      <span className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-2 block">Step {step.order}</span>
                      <h3 className={`text-xl font-bold text-white mb-2 ${step.is_completed ? 'line-through text-neutral-500' : 'group-hover:text-purple-300 transition-colors'}`}>{step.title}</h3>
                      <div className={`flex items-center gap-2 text-sm text-neutral-300 mb-4 ${isLeft ? 'md:justify-end' : ''}`}>
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>{step.estimated_time}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => toggleComplete(e, step)}
                      className="mt-1 flex-shrink-0 text-neutral-500 hover:text-purple-400 transition-colors"
                      disabled={isUpdating || roadmap.id === 'mock-id'}
                    >
                      {step.is_completed ? 
                        <CheckCircle2 className="w-8 h-8 text-purple-500" /> : 
                        <Circle className="w-8 h-8" />
                      }
                    </button>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                         <div className="pt-6 border-t border-white/10 mt-2 text-left">
                            {/* Theory Container */}
                            <div className="prose prose-invert prose-purple max-w-none text-neutral-300 text-sm md:text-base leading-relaxed mb-6">
                              <ReactMarkdown>{step.theory}</ReactMarkdown>
                            </div>

                            {/* YouTube Video Wrapper */}
                            {step.youtube_video_id ? (
                               <div className="mt-6">
                                 <div className="flex items-center gap-2 text-red-500 font-medium mb-3">
                                   <Youtube className="w-5 h-5" />
                                   <span>Recommended Resource</span>
                                 </div>
                                 <div className="relative pt-[56.25%] rounded-xl overflow-hidden border border-white/10 bg-neutral-950">
                                   <iframe
                                     className="absolute top-0 left-0 w-full h-full"
                                     src={`https://www.youtube.com/embed/${step.youtube_video_id}`}
                                     title="YouTube video player"
                                     frameBorder="0"
                                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                     allowFullScreen
                                   ></iframe>
                                 </div>
                               </div>
                            ) : (
                               <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Youtube className="w-5 h-5 text-neutral-500" />
                                    <span className="text-sm text-neutral-400">Search for: <span className="font-medium text-white">{step.youtube_query}</span></span>
                                  </div>
                                  <a 
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.youtube_query)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                               </div>
                            )}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex justify-center mt-4">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500 group-hover:text-purple-400 transition-colors" />}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
