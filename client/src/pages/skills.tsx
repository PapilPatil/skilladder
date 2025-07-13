import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SkillCard } from "@/components/skill-card";
import { AddSkillModal } from "@/components/add-skill-modal";
import { SkillImportModal } from "@/components/skill-import-modal";
import { SkillUpdateReminder } from "@/components/skill-update-reminder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Filter, Search, Code, Users } from "lucide-react";
import { type Skill } from "@shared/schema";

export default function Skills() {
  const currentUserId = 1; // Hardcoded for demo
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [proficiencyFilter, setProficiencyFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["/api/skills/user", currentUserId],
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      await apiRequest("DELETE", `/api/skills/${skillId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "stats"] });
      toast({
        title: "Success!",
        description: "Skill deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredSkills = skills.filter((skill: Skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || skill.category === categoryFilter;
    const matchesProficiency = proficiencyFilter === "all" || skill.proficiency === proficiencyFilter;
    return matchesSearch && matchesCategory && matchesProficiency;
  });

  const technicalSkills = filteredSkills.filter((skill: Skill) => skill.category === "Technical");
  const softSkills = filteredSkills.filter((skill: Skill) => skill.category === "Soft Skills");
  const otherSkills = filteredSkills.filter((skill: Skill) => 
    skill.category !== "Technical" && skill.category !== "Soft Skills"
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">My Skills</h2>
        <div className="flex space-x-3">
          <AddSkillModal userId={currentUserId} />
          <SkillImportModal userId={currentUserId} />
          <Button
            variant="outline"
            className="border-bronze-300 text-bronze-700 hover:bg-bronze-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Skill Update Reminder */}
      <div className="mb-8">
        <SkillUpdateReminder userId={currentUserId} />
      </div>

      {/* Search and Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technical">Technical Skills</SelectItem>
            <SelectItem value="Soft Skills">Soft Skills</SelectItem>
            <SelectItem value="Tools & Software">Tools & Software</SelectItem>
            <SelectItem value="Languages">Languages</SelectItem>
          </SelectContent>
        </Select>
        <Select value={proficiencyFilter} onValueChange={setProficiencyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skills Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Technical Skills */}
        {technicalSkills.length > 0 && (
          <div className="bronze-50 p-6 rounded-lg border border-bronze-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Code className="text-bronze-500 mr-2 w-5 h-5" />
              Technical Skills
            </h3>
            <div className="space-y-4">
              {technicalSkills.map((skill: Skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onDelete={(skillId) => deleteSkillMutation.mutate(skillId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Soft Skills */}
        {softSkills.length > 0 && (
          <div className="bronze-50 p-6 rounded-lg border border-bronze-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="text-bronze-500 mr-2 w-5 h-5" />
              Soft Skills
            </h3>
            <div className="space-y-4">
              {softSkills.map((skill: Skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onDelete={(skillId) => deleteSkillMutation.mutate(skillId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Skills */}
        {otherSkills.length > 0 && (
          <div className="bronze-50 p-6 rounded-lg border border-bronze-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="text-bronze-500 mr-2 w-5 h-5" />
              Other Skills
            </h3>
            <div className="space-y-4">
              {otherSkills.map((skill: Skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onDelete={(skillId) => deleteSkillMutation.mutate(skillId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <div className="bronze-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-10 h-10 text-bronze-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No skills found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== "all" || proficiencyFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Start building your professional profile by adding your first skill!"}
          </p>
          <AddSkillModal userId={currentUserId} />
        </div>
      )}
    </main>
  );
}
