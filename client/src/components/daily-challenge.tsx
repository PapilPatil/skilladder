import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Calendar, CheckCircle, Gift, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AddSkillModal } from "./add-skill-modal";

interface DailyChallengeProps {
  userId: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "skill_count" | "category_diversity" | "endorsement" | "streak";
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  difficulty: "easy" | "medium" | "hard";
}

export function DailyChallenge({ userId }: DailyChallengeProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
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
    generateDailyChallenges();
    loadDailyProgress();
  }, [userId, userStats, userSkills]);

  const generateDailyChallenges = () => {
    const today = new Date().toDateString();
    const savedChallenges = localStorage.getItem(`dailyChallenges_${userId}_${today}`);
    
    if (savedChallenges) {
      setChallenges(JSON.parse(savedChallenges));
      return;
    }

    const skillCount = userStats?.totalSkills || 0;
    const skillCategories = userSkills ? [...new Set(userSkills.map((skill: any) => skill.category))] : [];
    
    const newChallenges: Challenge[] = [
      {
        id: "daily_skill",
        title: "Daily Skill Builder",
        description: "Add 1 new skill to your profile",
        type: "skill_count",
        target: 1,
        current: 0,
        reward: 25,
        completed: false,
        difficulty: "easy"
      },
      {
        id: "category_explorer",
        title: "Category Explorer",
        description: "Add skills from 2 different categories",
        type: "category_diversity",
        target: 2,
        current: skillCategories.length,
        reward: 50,
        completed: skillCategories.length >= 2,
        difficulty: "medium"
      },
      {
        id: "skill_master",
        title: "Skill Master",
        description: "Add 3 skills today",
        type: "skill_count",
        target: 3,
        current: 0,
        reward: 100,
        completed: false,
        difficulty: "hard"
      }
    ];

    setChallenges(newChallenges);
    localStorage.setItem(`dailyChallenges_${userId}_${today}`, JSON.stringify(newChallenges));
  };

  const loadDailyProgress = () => {
    const today = new Date().toDateString();
    const completedCount = parseInt(localStorage.getItem(`dailyCompleted_${userId}_${today}`) || "0");
    setCompletedToday(completedCount);

    const currentStreak = parseInt(localStorage.getItem(`dailyStreak_${userId}`) || "0");
    setStreak(currentStreak);
  };

  const updateChallengeProgress = (challengeId: string, increment: number = 1) => {
    setChallenges(prev => {
      const updated = prev.map(challenge => {
        if (challenge.id === challengeId) {
          const newCurrent = challenge.current + increment;
          const completed = newCurrent >= challenge.target;
          
          if (completed && !challenge.completed) {
            // Award points for completing challenge
            const today = new Date().toDateString();
            const currentCompleted = parseInt(localStorage.getItem(`dailyCompleted_${userId}_${today}`) || "0");
            localStorage.setItem(`dailyCompleted_${userId}_${today}`, (currentCompleted + 1).toString());
            setCompletedToday(currentCompleted + 1);
            
            // Trigger achievement
            const achievement = {
              id: Date.now().toString(),
              title: "Challenge Complete! 🎯",
              description: `${challenge.title} completed! +${challenge.reward} points`,
              type: "points" as const,
            };
            (window as any).triggerAchievement?.(achievement);
          }
          
          return { ...challenge, current: newCurrent, completed };
        }
        return challenge;
      });
      
      // Save updated challenges
      const today = new Date().toDateString();
      localStorage.setItem(`dailyChallenges_${userId}_${today}`, JSON.stringify(updated));
      
      return updated;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter(c => c.completed).length;
  const progressPercentage = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;

  return (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Target className="w-5 h-5" />
            <span>Daily Challenges</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {streak > 0 && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                {streak} day streak 🔥
              </Badge>
            )}
            <Badge variant="outline">
              {completedChallenges}/{totalChallenges} completed
            </Badge>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`border rounded-lg p-4 transition-all ${
              challenge.completed 
                ? "bg-green-50 border-green-200" 
                : "bg-white border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{challenge.title}</span>
                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </Badge>
                  {challenge.completed && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{challenge.description}</p>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={challenge.target > 0 ? (challenge.current / challenge.target) * 100 : 0} 
                    className="h-1 flex-1" 
                  />
                  <span className="text-xs text-gray-500">
                    {challenge.current}/{challenge.target}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <div className="text-center">
                  <Gift className="w-4 h-4 text-yellow-600 mx-auto" />
                  <span className="text-xs text-yellow-700">+{challenge.reward}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {completedChallenges === totalChallenges && (
          <div className="text-center py-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <Trophy className="w-8 h-8 mx-auto text-gold mb-2" />
            <h3 className="font-semibold text-green-800">All Challenges Complete!</h3>
            <p className="text-sm text-green-700">Amazing work! Check back tomorrow for new challenges.</p>
          </div>
        )}

        {completedChallenges < totalChallenges && (
          <div className="text-center pt-2">
            <AddSkillModal
              userId={userId}
              trigger={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Add Skill to Complete Challenge
                </Button>
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}