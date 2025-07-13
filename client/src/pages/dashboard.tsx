import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/stats-card";
import { AddSkillModal } from "@/components/add-skill-modal";
import { SkillImportModal } from "@/components/skill-import-modal";
import { Button } from "@/components/ui/button";
import { Settings, Heart, Upload, Star, Trophy, Medal } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const currentUserId = 1; // Hardcoded for demo

  const { data: user } = useQuery({
    queryKey: ["/api/users", currentUserId],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/users", currentUserId, "stats"],
  });

  const { data: recentEndorsements = [] } = useQuery({
    queryKey: ["/api/endorsements/user", currentUserId],
  });

  const { data: topEndorsers = [] } = useQuery({
    queryKey: ["/api/leaderboard/endorsers"],
  });

  if (!user || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Continue building your professional profile</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Skills"
            value={stats.totalSkills}
            icon={Settings}
          />
          <StatsCard
            title="Endorsements"
            value={stats.totalEndorsements}
            icon={Heart}
          />
          <StatsCard
            title="Points"
            value={stats.points}
            icon={Trophy}
            iconColor="text-gold"
          />
          <StatsCard
            title="Rank"
            value={`#${stats.rank}`}
            icon={Medal}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AddSkillModal
            userId={currentUserId}
            trigger={
              <div className="bronze-gradient text-white p-6 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <Settings className="text-2xl mb-3 w-8 h-8" />
                <h3 className="text-lg font-semibold">Add New Skill</h3>
                <p className="text-sm opacity-90">Quickly add skills to your profile</p>
              </div>
            }
          />
          <Link href="/directory">
            <div className="bronze-100 text-bronze-700 p-6 rounded-lg hover:bronze-200 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <Heart className="text-2xl mb-3 w-8 h-8" />
              <h3 className="text-lg font-semibold">Endorse Colleagues</h3>
              <p className="text-sm opacity-90">Support your team members</p>
            </div>
          </Link>
          <SkillImportModal
            userId={currentUserId}
            trigger={
              <div className="bronze-100 text-bronze-700 p-6 rounded-lg hover:bronze-200 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <Upload className="text-2xl mb-3 w-8 h-8" />
                <h3 className="text-lg font-semibold">Import Skills</h3>
                <p className="text-sm opacity-90">From LinkedIn, resumes & more</p>
              </div>
            }
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Endorsements */}
          <div className="bronze-50 p-6 rounded-lg border border-bronze-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Heart className="text-bronze-500 mr-2 w-5 h-5" />
              Recent Endorsements
            </h3>
            <div className="space-y-4">
              {recentEndorsements.slice(0, 3).map((endorsement: any) => (
                <div
                  key={endorsement.id}
                  className="bg-white p-4 rounded-lg border hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bronze-300 rounded-full flex items-center justify-center">
                      <span className="text-bronze-700 font-semibold text-sm">
                        {endorsement.endorser?.name?.[0] || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{endorsement.endorser?.name}</p>
                      <p className="text-sm text-gray-600">
                        endorsed your {endorsement.skill?.name} skills
                      </p>
                    </div>
                  </div>
                  {endorsement.comment && (
                    <p className="text-sm text-gray-700 ml-13">
                      "{endorsement.comment}"
                    </p>
                  )}
                </div>
              ))}
              {recentEndorsements.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No endorsements yet. Start building your network!
                </p>
              )}
            </div>
          </div>

          {/* Top Endorsers */}
          <div className="bronze-50 p-6 rounded-lg border border-bronze-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Trophy className="text-gold mr-2 w-5 h-5" />
              Top Endorsers
            </h3>
            <div className="space-y-3">
              {topEndorsers.slice(0, 5).map((endorser: any, index: number) => (
                <div
                  key={endorser.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? "gamification-badge text-black"
                          : index === 1
                          ? "bg-gray-300 text-gray-800"
                          : index === 2
                          ? "bg-amber-600 text-white"
                          : "bg-bronze-200 text-bronze-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{endorser.name}</p>
                      <p className="text-sm text-gray-600">
                        {endorser.endorsementCount} endorsements given
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bronze-gradient text-white hover:shadow-lg transition-all duration-300"
                  >
                    Thank
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
