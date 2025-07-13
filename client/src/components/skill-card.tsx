import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { type Skill } from "@shared/schema";

interface SkillCardProps {
  skill: Skill;
  onEndorse?: (skillId: number) => void;
  onDelete?: (skillId: number) => void;
  showActions?: boolean;
}

export function SkillCard({ skill, onEndorse, onDelete, showActions = true }: SkillCardProps) {
  const getProficiencyLevel = (proficiency: string) => {
    switch (proficiency) {
      case "Beginner":
        return 25;
      case "Intermediate":
        return 50;
      case "Advanced":
        return 75;
      case "Expert":
        return 90;
      default:
        return 0;
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case "Beginner":
        return "bg-red-500";
      case "Intermediate":
        return "bg-yellow-500";
      case "Advanced":
        return "bg-blue-500";
      case "Expert":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="skill-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">{skill.name}</span>
        <div className="flex items-center space-x-2">
          <span className="text-bronze-600 text-sm font-medium">{skill.proficiency}</span>
          <Badge variant="secondary" className="bronze-gradient text-white">
            {skill.endorsementCount} endorsements
          </Badge>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProficiencyColor(skill.proficiency)}`}
            style={{ width: `${getProficiencyLevel(skill.proficiency)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-bronze-700 border-bronze-300">
            {skill.category}
          </Badge>
          {skill.source && skill.source !== "manual" && (
            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
              {skill.source === "linkedin" ? "LinkedIn" : 
               skill.source === "resume" ? "Resume" :
               skill.source === "project_tools" ? "Project Tools" :
               skill.source === "training" ? "Training" : skill.source}
            </Badge>
          )}
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            {onEndorse && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEndorse(skill.id)}
                className="text-bronze-700 hover:text-bronze-800 border-bronze-300"
              >
                <Heart className="w-4 h-4 mr-1" />
                Endorse
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(skill.id)}
                className="text-red-600 hover:text-red-700 border-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
