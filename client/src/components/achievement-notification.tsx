import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: "level" | "skill" | "endorsement" | "points";
}

export function AchievementNotification() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const removeAchievement = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  // Example function to trigger achievement (would be called from other components)
  const triggerAchievement = (achievement: Achievement) => {
    setAchievements(prev => [...prev, achievement]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeAchievement(achievement.id);
    }, 5000);
  };

  // Make the function available globally for demo purposes
  useEffect(() => {
    (window as any).triggerAchievement = triggerAchievement;
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {achievements.map((achievement) => (
        <Card
          key={achievement.id}
          className="bg-white border border-bronze-300 rounded-lg p-4 shadow-lg animate-slide-up max-w-sm"
        >
          <div className="flex items-start space-x-3">
            <div className="gamification-badge w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              {achievement.type === "level" ? (
                <Star className="w-5 h-5 text-black" />
              ) : (
                <Trophy className="w-5 h-5 text-black" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{achievement.title}</p>
              <p className="text-xs text-gray-600">{achievement.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAchievement(achievement.id)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
