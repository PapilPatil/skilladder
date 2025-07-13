import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trophy, Star, Zap, Target, TrendingUp, Medal, Gift, Sparkles, BookOpen, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddSkillModalProps {
  userId: number;
  trigger?: React.ReactNode;
}

export function AddSkillModal({ userId, trigger }: AddSkillModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [activeTab, setActiveTab] = useState("add");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showRewards, setShowRewards] = useState(false);
  const [streak, setStreak] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user stats for gamification
  const { data: userStats } = useQuery({
    queryKey: ["/api/users", userId, "stats"],
    staleTime: 30000
  });

  const { data: userSkills } = useQuery({
    queryKey: ["/api/skills/user", userId],
    staleTime: 30000
  });

  // Skill suggestions based on category
  const skillSuggestionsByCategory = {
    "Technical": [
      "JavaScript", "Python", "React", "Node.js", "SQL", "Docker", "AWS", "Git",
      "TypeScript", "MongoDB", "PostgreSQL", "Redis", "GraphQL", "Kubernetes",
      "Machine Learning", "Data Analysis", "API Development", "Cloud Computing"
    ],
    "Soft Skills": [
      "Leadership", "Communication", "Team Management", "Problem Solving",
      "Critical Thinking", "Adaptability", "Time Management", "Collaboration",
      "Presentation", "Negotiation", "Mentoring", "Strategic Planning",
      "Decision Making", "Emotional Intelligence", "Conflict Resolution"
    ],
    "Tools & Software": [
      "Jira", "Slack", "Figma", "Photoshop", "Excel", "Tableau", "PowerBI",
      "Salesforce", "HubSpot", "Asana", "Trello", "Confluence", "Zoom",
      "Microsoft Teams", "Google Workspace", "Sketch", "InVision"
    ],
    "Industry": [
      "Project Management", "Agile Methodologies", "Scrum", "DevOps",
      "Digital Marketing", "Content Strategy", "UX Design", "UI Design",
      "Business Analysis", "Quality Assurance", "Cybersecurity", "Compliance"
    ]
  };

  // Update suggestions when category changes
  useEffect(() => {
    if (category) {
      setSkillSuggestions(skillSuggestionsByCategory[category as keyof typeof skillSuggestionsByCategory] || []);
    } else {
      setSkillSuggestions([]);
    }
  }, [category]);

  // Calculate streaks and rewards
  const calculateRewards = () => {
    const skillCount = userStats?.totalSkills || 0;
    const basePoints = 10;
    let bonusPoints = 0;
    let bonusReason = "";

    // Streak bonuses
    if (skillCount > 0 && skillCount % 5 === 0) {
      bonusPoints += 25;
      bonusReason = "5-Skill Milestone Bonus!";
    } else if (skillCount > 0 && skillCount % 3 === 0) {
      bonusPoints += 15;
      bonusReason = "3-Skill Combo Bonus!";
    }

    // Daily skill addition bonus
    const today = new Date().toDateString();
    const lastSkillDate = localStorage.getItem(`lastSkillDate_${userId}`);
    if (lastSkillDate === today) {
      bonusPoints += 5;
      bonusReason = bonusReason ? `${bonusReason} + Daily Update` : "Daily Update Bonus!";
    }

    return { basePoints, bonusPoints, bonusReason };
  };

  const addSkillMutation = useMutation({
    mutationFn: async (skillData: any) => {
      const response = await apiRequest("POST", "/api/skills", skillData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/user", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "stats"] });
      
      const { basePoints, bonusPoints, bonusReason } = calculateRewards();
      const totalPoints = basePoints + bonusPoints;
      
      // Store last skill date
      localStorage.setItem(`lastSkillDate_${userId}`, new Date().toDateString());
      
      // Show reward animation
      setShowRewards(true);
      setTimeout(() => setShowRewards(false), 3000);
      
      toast({
        title: "🎉 Skill Added Successfully!",
        description: `+${totalPoints} points earned! ${bonusReason}`,
      });

      // Trigger achievement notification
      const achievement = {
        id: Date.now().toString(),
        title: "New Skill Mastered! 🚀",
        description: `${name} added with ${proficiency} proficiency. +${totalPoints} points!`,
        type: "skill" as const,
      };
      (window as any).triggerAchievement?.(achievement);
      
      setOpen(false);
      setName("");
      setCategory("");
      setProficiency("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !proficiency) return;

    addSkillMutation.mutate({
      userId,
      name,
      category,
      proficiency,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
  };

  const nextLevelProgress = userStats ? ((userStats.points % 100) / 100) * 100 : 0;
  const currentLevel = userStats ? Math.floor(userStats.points / 100) + 1 : 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bronze-gradient text-white hover:shadow-lg transition-all duration-300 relative">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
            {nextLevelProgress > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-bronze-500" />
            <span>Level Up Your Skills! 🚀</span>
          </DialogTitle>
        </DialogHeader>

        {/* Gamification Header */}
        <div className="bg-gradient-to-r from-bronze-50 to-gold-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Medal className="w-5 h-5 text-bronze-600" />
              <span className="font-semibold">Level {currentLevel}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{userStats?.points || 0} points</span>
            </div>
          </div>
          <Progress value={nextLevelProgress} className="h-2" />
          <p className="text-xs text-gray-600 mt-1">
            {100 - (userStats?.points || 0) % 100} points to next level
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">Add Skill</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category first" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">💻 Technical</SelectItem>
                    <SelectItem value="Soft Skills">🤝 Soft Skills</SelectItem>
                    <SelectItem value="Tools & Software">🛠️ Tools & Software</SelectItem>
                    <SelectItem value="Industry">🏢 Industry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Skill Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter skill name"
                  required
                />
                {skillSuggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {skillSuggestions.slice(0, 8).map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs hover:bg-bronze-50 border-bronze-200"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="proficiency">Proficiency Level</Label>
                <Select value={proficiency} onValueChange={setProficiency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">🌱 Beginner</SelectItem>
                    <SelectItem value="Intermediate">🌿 Intermediate</SelectItem>
                    <SelectItem value="Advanced">🌳 Advanced</SelectItem>
                    <SelectItem value="Expert">🏆 Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reward Preview */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Gift className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Reward Preview</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Base: +10 points • 
                  {userStats?.totalSkills && userStats.totalSkills % 5 === 4 && " Milestone bonus: +25 points •"}
                  {userStats?.totalSkills && userStats.totalSkills % 3 === 2 && " Combo bonus: +15 points •"}
                  {" Daily update bonus: +5 points"}
                </p>
              </div>

              <Button
                type="submit"
                disabled={addSkillMutation.isPending || !name || !category || !proficiency}
                className="w-full bronze-gradient text-white hover:shadow-lg transition-all duration-300 relative"
              >
                {addSkillMutation.isPending ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Skill...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Add Skill & Earn Points
                  </span>
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-4">
            <div className="text-center py-4">
              <BookOpen className="w-12 h-12 mx-auto text-bronze-500 mb-2" />
              <h3 className="text-lg font-semibold mb-2">Skill Suggestions</h3>
              <p className="text-sm text-gray-600">Based on trending skills in your industry</p>
            </div>
            
            <div className="grid gap-3">
              {Object.entries(skillSuggestionsByCategory).map(([cat, skills]) => (
                <Card key={cat}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      {cat === "Technical" && "💻"}
                      {cat === "Soft Skills" && "🤝"}
                      {cat === "Tools & Software" && "🛠️"}
                      {cat === "Industry" && "🏢"}
                      <span className="ml-2">{cat}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 6).map((skill) => (
                        <Button
                          key={skill}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCategory(cat);
                            setName(skill);
                            setActiveTab("add");
                          }}
                          className="text-xs hover:bg-bronze-50 border-bronze-200"
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            <div className="text-center py-4">
              <TrendingUp className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
              <p className="text-sm text-gray-600">Keep adding skills to level up!</p>
            </div>
            
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Current Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Skills</span>
                    <Badge variant="secondary">{userStats?.totalSkills || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Points</span>
                    <Badge variant="secondary">{userStats?.points || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Level</span>
                    <Badge variant="secondary">Level {currentLevel}</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Next Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Next level: {100 - (userStats?.points || 0) % 100} points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-bronze-500" />
                    <span className="text-sm">5-skill milestone: {5 - ((userStats?.totalSkills || 0) % 5)} skills</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Daily bonus: Add skill today</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reward Animation */}
        {showRewards && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center animate-bounce">
              <div className="text-6xl mb-2">🎉</div>
              <div className="text-xl font-bold text-bronze-600">Skill Added!</div>
              <div className="text-sm text-gray-600">Points earned!</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
