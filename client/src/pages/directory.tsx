import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeCard } from "@/components/employee-card";
import { EndorseModal } from "@/components/endorse-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users } from "lucide-react";
import { type User, type Skill } from "@shared/schema";

export default function Directory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: allSkills = [] } = useQuery({
    queryKey: ["/api/skills"],
  });

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    // Filter out current user for demo
    return matchesSearch && user.id !== 1;
  });

  const getUserSkills = (userId: number): Skill[] => {
    return allSkills.filter((skill: Skill) => skill.userId === userId);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="text-bronze-500 w-8 h-8" />
          <h2 className="text-3xl font-bold">Employee Directory</h2>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search colleagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button className="bronze-gradient text-white hover:shadow-lg transition-all duration-300">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user: User) => (
          <EmployeeCard
            key={user.id}
            user={user}
            skills={getUserSkills(user.id)}
            onEndorse={(userId) => {
              const targetUser = users.find((u: User) => u.id === userId);
              if (targetUser) {
                setSelectedUser(targetUser);
              }
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="bronze-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-bronze-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No colleagues found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search terms."
              : "No colleagues are currently available in the directory."}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-bronze-300 text-bronze-700"
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Endorse Modal */}
      {selectedUser && (
        <EndorseModal
          user={selectedUser}
          trigger={<div />}
        />
      )}
    </main>
  );
}
