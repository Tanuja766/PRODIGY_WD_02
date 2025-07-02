import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Moon, Sun } from 'lucide-react';

interface LapTime {
  id: number;
  time: number;
  formattedTime: string;
}

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load saved data on component mount
  useEffect(() => {
    const savedLapTimes = localStorage.getItem('stopwatch-lap-times');
    const savedDarkMode = localStorage.getItem('stopwatch-dark-mode');
    
    if (savedLapTimes) {
      try {
        setLapTimes(JSON.parse(savedLapTimes));
      } catch (error) {
        console.error('Failed to load lap times:', error);
      }
    }
    
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save lap times to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stopwatch-lap-times', JSON.stringify(lapTimes));
  }, [lapTimes]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('stopwatch-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (milliseconds: number): string => {
    const totalMs = Math.max(0, Math.floor(milliseconds));
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleLap = () => {
    if (time > 0) {
      const newLap: LapTime = {
        id: lapTimes.length + 1,
        time: time,
        formattedTime: formatTime(time)
      };
      setLapTimes(prev => [newLap, ...prev]);
    }
  };

  const handleClearLaps = () => {
    setLapTimes([]);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeClasses = isDarkMode 
    ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';

  const cardClasses = isDarkMode
    ? 'bg-white/10 backdrop-blur-lg border-white/20 text-white'
    : 'bg-white/80 backdrop-blur-lg border-gray-200 text-gray-900';

  const textClasses = isDarkMode ? 'text-white' : 'text-gray-900';
  const subtextClasses = isDarkMode ? 'text-slate-300' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${themeClasses} flex items-center justify-center p-4 transition-all duration-500`}>
      <div className="w-full max-w-md mx-auto">
        {/* Header with Dark Mode Toggle */}
        <div className="text-center mb-8 relative">
          <button
            onClick={toggleDarkMode}
            className={`absolute top-0 right-0 p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-12 active:scale-95 ${
              isDarkMode 
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/25' 
                : 'bg-slate-700/20 text-slate-700 hover:bg-slate-700/30 hover:shadow-lg hover:shadow-slate-700/25'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}>
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${textClasses} mb-2`}>Stopwatch</h1>
          <p className={subtextClasses}>Precision timing at your fingertips</p>
        </div>

        {/* Main Timer Display */}
        <div className={`${cardClasses} rounded-3xl p-8 mb-6 border shadow-2xl transition-all duration-300`}>
          <div className="text-center">
            <div className={`text-5xl md:text-6xl font-mono font-bold ${textClasses} mb-6 tracking-wider leading-tight transition-all duration-300`}>
              {formatTime(time)}
            </div>
            <div className={`text-sm ${subtextClasses} mb-8`}>
              MM:SS.MS
            </div>
            
            {/* Control Buttons */}
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={handleStartPause}
                className={`group flex items-center justify-center w-16 h-16 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl ${
                  isRunning
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/25 hover:shadow-red-500/40 hover:rotate-3'
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/25 hover:shadow-green-500/40 hover:-rotate-3'
                }`}
              >
                {isRunning ? (
                  <Pause className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5 transition-transform duration-200 group-hover:scale-110" />
                )}
              </button>
              
              <button
                onClick={handleLap}
                disabled={time === 0}
                className="group px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:transform-none disabled:shadow-none hover:-translate-y-0.5"
              >
                <span className="transition-transform duration-200 group-hover:scale-105">Lap</span>
              </button>
              
              <button
                onClick={handleReset}
                className="group flex items-center justify-center w-16 h-16 rounded-full bg-slate-600 text-white hover:bg-slate-700 font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl hover:rotate-12"
              >
                <RotateCcw className="w-6 h-6 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Lap Times */}
        {lapTimes.length > 0 && (
          <div className={`${cardClasses} rounded-3xl p-6 border shadow-2xl transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${textClasses}`}>
                Lap Times ({lapTimes.length})
              </h3>
              <button
                onClick={handleClearLaps}
                className={`px-3 py-1 text-sm rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                }`}
              >
                Clear
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {lapTimes.map((lap, index) => (
                  <div
                    key={lap.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 ${
                      isDarkMode
                        ? index % 2 === 0 ? 'bg-white/5 hover:bg-white/15' : 'bg-white/10 hover:bg-white/20'
                        : index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100 hover:bg-gray-150'
                    } border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-blue-500/20 text-blue-600'
                      }`}>
                        {lap.id}
                      </span>
                      <span className={subtextClasses}>Lap {lap.id}</span>
                    </div>
                    <span className={`font-mono ${textClasses} font-semibold`}>
                      {lap.formattedTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
        }
      `}</style>
    </div>
  );
}

export default App;