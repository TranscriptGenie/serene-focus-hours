
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(4); // 4 hours default
  const [dailyProgress, setDailyProgress] = useState(0);
  const [todaysSessions, setTodaysSessions] = useState([]);
  const intervalRef = useRef(null);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('focusStopwatch');
    if (savedData) {
      const { dailyProgress: savedProgress, goal, sessions } = JSON.parse(savedData);
      setDailyProgress(savedProgress || 0);
      setDailyGoal(goal || 4);
      setTodaysSessions(sessions || []);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    toast.success("Focus session started", {
      description: "You're in the zone now ✨"
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    toast("Session paused", {
      description: "Take a mindful break"
    });
  };

  const handleStop = () => {
    if (seconds > 0) {
      const sessionMinutes = Math.round(seconds / 60);
      const sessionHours = sessionMinutes / 60;
      
      const newProgress = dailyProgress + sessionHours;
      const newSessions = [...todaysSessions, {
        duration: seconds,
        timestamp: Date.now()
      }];

      setDailyProgress(newProgress);
      setTodaysSessions(newSessions);

      // Save to localStorage
      localStorage.setItem('focusStopwatch', JSON.stringify({
        dailyProgress: newProgress,
        goal: dailyGoal,
        sessions: newSessions
      }));

      toast.success("Focus session completed!", {
        description: `${sessionMinutes} minutes of deep work recorded`
      });
    }
    
    setIsRunning(false);
    setSeconds(0);
  };

  const progressPercentage = Math.min((dailyProgress / dailyGoal) * 100, 100);
  const currentSessionHours = seconds / 3600;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/20 via-cream to-gold/30 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl text-sage-dark font-medium">
            Deep Focus
          </h1>
          <p className="text-warm-gray text-lg font-light">
            Your sanctuary for meaningful work
          </p>
        </div>

        {/* Main Timer Card */}
        <Card className="glass-effect border-sage/20 shadow-xl">
          <div className="p-12 text-center space-y-8">
            
            {/* Timer Display */}
            <div className="space-y-4">
              <div className="font-display text-6xl text-sage-dark font-medium tracking-tight">
                {formatTime(seconds)}
              </div>
              <div className="text-warm-gray text-sm font-light">
                {isRunning ? "In deep focus" : "Ready to begin"}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <Button 
                  onClick={handleStart}
                  className="bg-sage hover:bg-sage-dark text-white px-8 py-6 text-lg rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Begin Focus
                </Button>
              ) : (
                <Button 
                  onClick={handlePause}
                  variant="outline"
                  className="border-sage text-sage hover:bg-sage/10 px-8 py-6 text-lg rounded-full"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button 
                onClick={handleStop}
                variant="outline"
                className="border-warm-gray/30 text-warm-gray hover:bg-warm-gray/10 px-8 py-6 text-lg rounded-full"
                disabled={seconds === 0}
              >
                <Square className="w-4 h-4 mr-2" />
                Complete
              </Button>
            </div>
          </div>
        </Card>

        {/* Daily Progress */}
        <Card className="glass-effect border-sage/20 shadow-lg">
          <div className="p-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-sage" />
                <h3 className="text-xl font-medium text-sage-dark">Today's Journey</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-medium text-sage-dark">
                  {(dailyProgress + currentSessionHours).toFixed(1)}h
                </div>
                <div className="text-sm text-warm-gray">of {dailyGoal}h goal</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <Progress 
                value={progressPercentage + (currentSessionHours / dailyGoal * 100)} 
                className="h-3 bg-sage/20"
              />
              <div className="flex justify-between text-sm text-warm-gray">
                <span>{Math.round(progressPercentage)}% complete</span>
                <span>
                  {dailyGoal - dailyProgress > 0 ? 
                    `${(dailyGoal - dailyProgress).toFixed(1)}h remaining` : 
                    "Goal achieved! ✨"
                  }
                </span>
              </div>
            </div>

            {/* Today's Sessions */}
            {todaysSessions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-sage/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sage" />
                  <span className="text-sm font-medium text-sage-dark">
                    {todaysSessions.length} session{todaysSessions.length !== 1 ? 's' : ''} today
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {todaysSessions.slice(-5).map((session, index) => (
                    <div 
                      key={index}
                      className="px-3 py-1 bg-sage/10 text-sage text-xs rounded-full"
                    >
                      {Math.round(session.duration / 60)}m
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Inspirational Quote */}
        <div className="text-center py-8">
          <blockquote className="font-display text-lg text-sage-dark italic font-light">
            "The quieter you become, the more able you are to hear."
          </blockquote>
          <cite className="text-warm-gray text-sm mt-2 block">— Rumi</cite>
        </div>
      </div>
    </div>
  );
};

export default Index;
