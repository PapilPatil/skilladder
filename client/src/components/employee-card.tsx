import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, User as UserIcon } from "lucide-react";
import { type User, type Skill } from "@shared/schema";

interface EmployeeCardProps {
  user: User;
  skills: Skill[];
  onEndorse: (userId: number) => void;
}

export function EmployeeCard({ user, skills, onEndorse }: EmployeeCardProps) {
  const topSkills = skills.slice(0, 3);

  return (
    <div className="bronze-50 p-6 rounded-lg border border-bronze-200 hover:shadow-lg transition-all duration-300">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bronze-300 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserIcon className="text-bronze-700 w-6 h-6" />
        </div>
        <h3 className="font-semibold text-lg">{user.name}</h3>
        <p className="text-sm text-gray-600">{user.role}</p>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <span className="text-xs text-bronze-600">Level {user.level}</span>
          <span className="text-xs text-bronze-600">•</span>
          <span className="text-xs text-bronze-600">{user.points} pts</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2">
          {topSkills.map((skill) => (
            <Badge 
              key={skill.id}
              variant="secondary" 
              className="bronze-200 text-bronze-700 text-xs"
            >
              {skill.name}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="outline" className="text-bronze-600 border-bronze-300 text-xs">
              +{skills.length - 3} more
            </Badge>
          )}
        </div>
      </div>
      
      <Button
        className="w-full bronze-gradient text-white hover:shadow-lg transition-all duration-300"
        onClick={() => onEndorse(user.id)}
      >
        <Heart className="w-4 h-4 mr-2" />
        Endorse Skills
      </Button>
    </div>
  );
}
