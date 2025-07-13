import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Trophy, ThumbsUp, Star } from "lucide-react";
import { Link } from "wouter";

export default function Endorsements() {
  const currentUserId = 1; // Hardcoded for demo

  const { data: endorsements = [], isLoading } = useQuery({
    queryKey: ["/api/endorsements/user", currentUserId],
  });

  const { data: topEndorsers = [] } = useQuery({
    queryKey: ["/api/leaderboard/endorsers"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <h2 className="text-3xl font-bold">Endorsements</h2>
        <Link href="/directory">
          <Button className="bronze-gradient text-white hover:shadow-lg transition-all duration-300">
            <Heart className="w-4 h-4 mr-2" />
            Endorse Colleagues
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Endorsements Received */}
        <Card className="bronze-50 border-bronze-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ThumbsUp className="text-bronze-500 mr-2 w-5 h-5" />
              Recent Endorsements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {endorsements.slice(0, 5).map((endorsement: any) => (
                <div
                  key={endorsement.id}
                  className={`bg-white p-4 rounded-lg border transition-all duration-300 ${
                    endorsement.comment ? "endorsement-glow" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bronze-300 rounded-full flex items-center justify-center">
                      <span className="text-bronze-700 font-semibold text-sm">
                        {endorsement.endorser?.name?.[0] || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{endorsement.endorser?.name || "Unknown"}</p>
                      <p className="text-sm text-gray-600">
                        endorsed your <span className="font-medium">{endorsement.skill?.name}</span> skills
                      </p>
                    </div>
                  </div>
                  {endorsement.comment && (
                    <p className="text-sm text-gray-700 ml-13 italic">
                      "{endorsement.comment}"
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-bronze-700 border-bronze-300">
                      {endorsement.skill?.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(endorsement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {endorsements.length === 0 && (
                <div className="text-center py-8">
                  <div className="bronze-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-bronze-500" />
                  </div>
                  <p className="text-gray-500 mb-4">No endorsements yet</p>
                  <Link href="/directory">
                    <Button variant="outline" className="border-bronze-300 text-bronze-700">
                      Start networking
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Endorsement Leaderboard */}
        <Card className="bronze-50 border-bronze-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="text-gold mr-2 w-5 h-5" />
              Top Endorsers
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      Level {endorser.level}
                    </Badge>
                    <Button
                      size="sm"
                      className="bronze-gradient text-white hover:shadow-lg transition-all duration-300"
                      onClick={() => {
                        const achievement = {
                          id: Date.now().toString(),
                          title: "Thank You Sent!",
                          description: `You thanked ${endorser.name} for their support`,
                          type: "endorsement" as const,
                        };
                        (window as any).triggerAchievement?.(achievement);
                      }}
                    >
                      Thank
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endorsement Stats */}
      <Card className="mt-6 bronze-50 border-bronze-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="text-bronze-500 mr-2 w-5 h-5" />
            Your Endorsement Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-bronze-600 mb-2">
                {endorsements.length}
              </div>
              <p className="text-sm text-gray-600">Total Endorsements Received</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-bronze-600 mb-2">
                {endorsements.filter((e: any) => e.comment).length}
              </div>
              <p className="text-sm text-gray-600">With Comments</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-bronze-600 mb-2">
                {new Set(endorsements.map((e: any) => e.endorser?.id)).size}
              </div>
              <p className="text-sm text-gray-600">Unique Endorsers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
