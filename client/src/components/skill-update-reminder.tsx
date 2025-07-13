import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, Calendar, Bell, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AddSkillModal } from "./add-skill-modal";

interface SkillUpdateReminderProps {
  userId: number;
}

export function SkillUpdateReminder({ userId }: SkillUpdateReminderProps) {
  const [lastUpdateDays, setLastUpdateDays] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [streak, setStreak] = useState(0);

  const { data: userStats } = useQuery({
    queryKey: ["/api/users", userId, "stats"],
    staleTime: 30000
  });

  const { data: userSkills } = useQuery({
    queryKey: ["/api/skills/user", userId],
    staleTime: 30000
  });

  useEffect(() => {
    // Calculate days since last skill update
    const lastUpdateDate = localStorage.getItem(`lastSkillUpdate_${userId}`);
    if (lastUpdateDate) {
      const days = Math.floor((Date.now() - new Date(lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24));
      setLastUpdateDays(days);
      setShowReminder(days >= 3); // Show reminder after 3 days
    } else {
      setShowReminder(true);
    }

    // Calculate streak
    const currentStreak = parseInt(localStorage.getItem(`skillStreak_${userId}`) || "0");
    setStreak(currentStreak);
  }, [userId]);

  const getMotivationalMessage = () => {
    if (lastUpdateDays >= 7) {
      return "🔥 Your skills are getting rusty! Time to add some new ones!";
    } else if (lastUpdateDays >= 3) {
      return "⚡ Keep your momentum going! Add a skill today!";
    } else {
      return "🚀 You're on a roll! What new skill did you learn today?";
    }
  };

  const getDailyChallenge = () => {
    const challenges = [
      "Add a technical skill you learned this week",
      "Update your soft skills based on recent experiences",
      "Add a new tool you've been using",
      "Include a certification or training you completed",
      "Add a skill from a recent project",
      "Update your industry knowledge",
      "Add a language or framework you've been exploring"
    ];
    
    const today = new Date().getDay();
    return challenges[today];
  };

  const handleSkillAdded = () => {
    localStorage.setItem(`lastSkillUpdate_${userId}`, new Date().toISOString());
    setLastUpdateDays(0);
    setShowReminder(false);
    
    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem(`skillStreak_${userId}`, newStreak.toString());
  };

  if (!showReminder && lastUpdateDays < 3) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-bronze-500 bg-gradient-to-r from-bronze-50 to-white shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-bronze-800">
          <Bell className="w-5 h-5" />
          <span>Skill Update Reminder</span>
          {streak > 0 && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-300">
              {streak} day streak! 🔥
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {lastUpdateDays === 0 ? "Updated today" : 
             lastUpdateDays === 1 ? "Updated yesterday" : 
             `Updated ${lastUpdateDays} days ago`}
          </span>
        </div>

        <div className="bg-white rounded-lg p-3 border border-bronze-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-bronze-600" />
            <span className="font-medium text-sm">Today's Challenge</span>
          </div>
          <p className="text-sm text-gray-700">{getDailyChallenge()}</p>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-bronze-700 mb-3">
            {getMotivationalMessage()}
          </p>
          
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-bronze-600">{userStats?.totalSkills || 0}</div>
              <div className="text-xs text-gray-500">Total Skills</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{userStats?.points || 0}</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{Math.floor((userStats?.points || 0) / 100) + 1}</div>
              <div className="text-xs text-gray-500">Level</div>
            </div>
          </div>

          <AddSkillModal
            userId={userId}
            trigger={
              <Button className="bronze-gradient text-white hover:shadow-lg transition-all duration-300 w-full">
                <Zap className="w-4 h-4 mr-2" />
                Add Skill Now & Earn Points
              </Button>
            }
          />
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Skills are fluid - keep them updated!</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReminder(false)}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}