import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, User as UserIcon } from "lucide-react";
import { type User, type Skill } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface EndorseModalProps {
  user: User;
  trigger?: React.ReactNode;
}

export function EndorseModal({ user, trigger }: EndorseModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills = [] } = useQuery({
    queryKey: ["/api/skills/user", user.id],
    enabled: open,
  });

  const endorseMutation = useMutation({
    mutationFn: async (endorsementData: any) => {
      const response = await apiRequest("POST", "/api/endorsements", endorsementData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/endorsements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({
        title: "Success!",
        description: "Endorsement submitted successfully. +5 points earned!",
      });
      setOpen(false);
      setSelectedSkill(null);
      setComment("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit endorsement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;

    endorseMutation.mutate({
      skillId: selectedSkill,
      endorserId: 1, // Current user ID (hardcoded for demo)
      endorseeId: user.id,
      comment,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bronze-gradient text-white hover:shadow-lg transition-all duration-300">
            <Heart className="w-4 h-4 mr-2" />
            Endorse Skills
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>Endorse {user.name}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select Skill to Endorse</Label>
            <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
              {skills.map((skill: Skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkill(skill.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedSkill === skill.id
                      ? "border-bronze-500 bg-bronze-50"
                      : "border-gray-200 hover:border-bronze-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {skill.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {skill.proficiency} • {skill.endorsementCount} endorsements
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Write a comment about their skill..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bronze-gradient text-white hover:shadow-lg transition-all duration-300"
              disabled={!selectedSkill || endorseMutation.isPending}
            >
              {endorseMutation.isPending ? "Submitting..." : "Submit Endorsement"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
