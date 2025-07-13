import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";

interface AddSkillModalProps {
  userId: number;
  trigger?: React.ReactNode;
}

export function AddSkillModal({ userId, trigger }: AddSkillModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [proficiency, setProficiency] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addSkillMutation = useMutation({
    mutationFn: async (skillData: any) => {
      const response = await apiRequest("POST", "/api/skills", skillData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/user", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "stats"] });
      toast({
        title: "Success!",
        description: "Skill added successfully. +10 points earned!",
      });
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bronze-gradient text-white hover:shadow-lg transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Skill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Skill Name</Label>
            <Input
              id="name"
              placeholder="e.g., JavaScript, Leadership"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technical">Technical Skills</SelectItem>
                <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                <SelectItem value="Tools & Software">Tools & Software</SelectItem>
                <SelectItem value="Languages">Languages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="proficiency">Proficiency Level</Label>
            <Select value={proficiency} onValueChange={setProficiency} required>
              <SelectTrigger>
                <SelectValue placeholder="Select proficiency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bronze-gradient text-white hover:shadow-lg transition-all duration-300"
              disabled={addSkillMutation.isPending}
            >
              {addSkillMutation.isPending ? "Adding..." : "Add Skill"}
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
