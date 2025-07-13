import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, Users, Briefcase, GraduationCap, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SkillImportModalProps {
  userId: number;
  trigger?: React.ReactNode;
}

interface ImportedSkill {
  name: string;
  category: string;
  proficiency: string;
  source: string;
  selected: boolean;
}

export function SkillImportModal({ userId, trigger }: SkillImportModalProps) {
  const [open, setOpen] = useState(false);
  const [importedSkills, setImportedSkills] = useState<ImportedSkill[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addSkillsMutation = useMutation({
    mutationFn: async (skills: ImportedSkill[]) => {
      const promises = skills.map(skill => 
        apiRequest("POST", "/api/skills", {
          userId,
          name: skill.name,
          category: skill.category,
          proficiency: skill.proficiency,
          source: skill.source
        })
      );
      return Promise.all(promises);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/user", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "stats"] });
      toast({
        title: "Skills Imported Successfully!",
        description: `${data.length} skills have been added to your profile. +${data.length * 10} points earned!`,
      });
      setOpen(false);
      setImportedSkills([]);
      setResumeText("");
      setLinkedinUrl("");
      
      // Trigger achievement notification
      const achievement = {
        id: Date.now().toString(),
        title: "Skills Import Complete!",
        description: `Successfully imported ${data.length} new skills`,
        type: "skill" as const,
      };
      (window as any).triggerAchievement?.(achievement);
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to import skills. Please try again.",
        variant: "destructive",
      });
    },
  });

  const parseResumeText = (text: string): ImportedSkill[] => {
    const skills: ImportedSkill[] = [];
    
    // Common technical skills patterns
    const techSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue.js', 'Node.js', 
      'Express', 'Django', 'Flask', 'Spring', 'AWS', 'Azure', 'Google Cloud', 'Docker',
      'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Git', 'Jenkins',
      'HTML', 'CSS', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'
    ];
    
    // Soft skills patterns
    const softSkills = [
      'Leadership', 'Communication', 'Team Management', 'Project Management', 'Problem Solving',
      'Critical Thinking', 'Collaboration', 'Adaptability', 'Time Management', 'Presentation',
      'Negotiation', 'Mentoring', 'Strategic Planning', 'Decision Making', 'Innovation'
    ];
    
    // Tools and software
    const tools = [
      'Jira', 'Confluence', 'Slack', 'Trello', 'Asana', 'Figma', 'Sketch', 'Photoshop',
      'Illustrator', 'Tableau', 'PowerBI', 'Excel', 'Word', 'PowerPoint', 'Salesforce',
      'HubSpot', 'Zoom', 'Microsoft Teams', 'Google Workspace', 'Office 365'
    ];

    const textUpper = text.toUpperCase();
    
    // Check for technical skills
    techSkills.forEach(skill => {
      if (textUpper.includes(skill.toUpperCase())) {
        skills.push({
          name: skill,
          category: 'Technical',
          proficiency: 'Intermediate',
          source: 'resume',
          selected: true
        });
      }
    });
    
    // Check for soft skills
    softSkills.forEach(skill => {
      if (textUpper.includes(skill.toUpperCase())) {
        skills.push({
          name: skill,
          category: 'Soft Skills',
          proficiency: 'Advanced',
          source: 'resume',
          selected: true
        });
      }
    });
    
    // Check for tools
    tools.forEach(tool => {
      if (textUpper.includes(tool.toUpperCase())) {
        skills.push({
          name: tool,
          category: 'Tools & Software',
          proficiency: 'Advanced',
          source: 'resume',
          selected: true
        });
      }
    });
    
    return skills;
  };

  const generateLinkedInSkills = (): ImportedSkill[] => {
    // Simulated LinkedIn skills import
    const linkedinSkills = [
      { name: 'Strategic Planning', category: 'Soft Skills', proficiency: 'Expert' },
      { name: 'Machine Learning', category: 'Technical', proficiency: 'Advanced' },
      { name: 'Data Analysis', category: 'Technical', proficiency: 'Expert' },
      { name: 'Team Leadership', category: 'Soft Skills', proficiency: 'Expert' },
      { name: 'Product Management', category: 'Soft Skills', proficiency: 'Advanced' },
      { name: 'Agile Methodologies', category: 'Tools & Software', proficiency: 'Expert' },
      { name: 'SQL', category: 'Technical', proficiency: 'Advanced' },
      { name: 'Public Speaking', category: 'Soft Skills', proficiency: 'Intermediate' },
    ];
    
    return linkedinSkills.map(skill => ({
      ...skill,
      source: 'linkedin',
      selected: true
    }));
  };

  const generateProjectToolsSkills = (): ImportedSkill[] => {
    // Simulated project management tools skills
    const projectSkills = [
      { name: 'Scrum Master', category: 'Soft Skills', proficiency: 'Expert' },
      { name: 'Kanban', category: 'Tools & Software', proficiency: 'Advanced' },
      { name: 'Sprint Planning', category: 'Soft Skills', proficiency: 'Advanced' },
      { name: 'Risk Management', category: 'Soft Skills', proficiency: 'Intermediate' },
      { name: 'Budget Management', category: 'Soft Skills', proficiency: 'Advanced' },
      { name: 'Stakeholder Management', category: 'Soft Skills', proficiency: 'Expert' },
    ];
    
    return projectSkills.map(skill => ({
      ...skill,
      source: 'project_tools',
      selected: true
    }));
  };

  const generateTrainingSkills = (): ImportedSkill[] => {
    // Simulated training/certification skills
    const trainingSkills = [
      { name: 'AWS Certified Solutions Architect', category: 'Technical', proficiency: 'Expert' },
      { name: 'PMP Certification', category: 'Soft Skills', proficiency: 'Expert' },
      { name: 'Certified Scrum Master', category: 'Soft Skills', proficiency: 'Expert' },
      { name: 'Google Analytics', category: 'Tools & Software', proficiency: 'Advanced' },
      { name: 'Salesforce Administrator', category: 'Tools & Software', proficiency: 'Advanced' },
    ];
    
    return trainingSkills.map(skill => ({
      ...skill,
      source: 'training',
      selected: true
    }));
  };

  const handleImport = (type: string) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      let newSkills: ImportedSkill[] = [];
      
      switch (type) {
        case 'resume':
          newSkills = parseResumeText(resumeText);
          break;
        case 'linkedin':
          newSkills = generateLinkedInSkills();
          break;
        case 'project_tools':
          newSkills = generateProjectToolsSkills();
          break;
        case 'training':
          newSkills = generateTrainingSkills();
          break;
      }
      
      setImportedSkills(newSkills);
      setIsProcessing(false);
      
      toast({
        title: "Skills Detected!",
        description: `Found ${newSkills.length} skills. Review and select which ones to import.`,
      });
    }, 1500);
  };

  const toggleSkillSelection = (index: number) => {
    setImportedSkills(prev => 
      prev.map((skill, i) => 
        i === index ? { ...skill, selected: !skill.selected } : skill
      )
    );
  };

  const updateSkillProficiency = (index: number, proficiency: string) => {
    setImportedSkills(prev => 
      prev.map((skill, i) => 
        i === index ? { ...skill, proficiency } : skill
      )
    );
  };

  const selectedSkills = importedSkills.filter(skill => skill.selected);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bronze-gradient text-white hover:shadow-lg transition-all duration-300">
            <Upload className="w-4 h-4 mr-2" />
            Import Skills
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Skills from External Sources</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="resume" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="project_tools">Project Tools</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Resume/CV Import
                </CardTitle>
                <CardDescription>
                  Paste your resume text and we'll automatically detect skills mentioned
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="resume">Resume Text</Label>
                  <Textarea
                    id="resume"
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={8}
                  />
                </div>
                <Button 
                  onClick={() => handleImport('resume')}
                  disabled={!resumeText.trim() || isProcessing}
                  className="bronze-gradient text-white"
                >
                  {isProcessing ? "Processing..." : "Analyze Resume"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="linkedin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  LinkedIn Profile Import
                </CardTitle>
                <CardDescription>
                  Import skills from your LinkedIn profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleImport('linkedin')}
                  disabled={isProcessing}
                  className="bronze-gradient text-white"
                >
                  {isProcessing ? "Importing..." : "Import from LinkedIn"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="project_tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Project Management Tools
                </CardTitle>
                <CardDescription>
                  Import skills from your project management and development tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Jira/Confluence</Label>
                    <p className="text-sm text-gray-600">Project management skills</p>
                  </div>
                  <div>
                    <Label>Scrum/Agile Tools</Label>
                    <p className="text-sm text-gray-600">Methodology expertise</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleImport('project_tools')}
                  disabled={isProcessing}
                  className="bronze-gradient text-white"
                >
                  {isProcessing ? "Importing..." : "Import Project Skills"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Training & Certifications
                </CardTitle>
                <CardDescription>
                  Import skills from your training history and certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>AWS Certifications</Label>
                    <p className="text-sm text-gray-600">Cloud computing skills</p>
                  </div>
                  <div>
                    <Label>Professional Certifications</Label>
                    <p className="text-sm text-gray-600">Industry credentials</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleImport('training')}
                  disabled={isProcessing}
                  className="bronze-gradient text-white"
                >
                  {isProcessing ? "Importing..." : "Import Training Skills"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {importedSkills.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Detected Skills</h3>
              <Badge variant="secondary">
                {selectedSkills.length} of {importedSkills.length} selected
              </Badge>
            </div>
            
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {importedSkills.map((skill, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    skill.selected 
                      ? "border-bronze-500 bg-bronze-50" 
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSkillSelection(index)}
                        className={`w-6 h-6 p-0 rounded-full ${
                          skill.selected 
                            ? "bg-bronze-500 text-white" 
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {skill.selected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </Button>
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {skill.source}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="w-32">
                      <Select 
                        value={skill.proficiency} 
                        onValueChange={(value) => updateSkillProficiency(index, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => addSkillsMutation.mutate(selectedSkills)}
                disabled={selectedSkills.length === 0 || addSkillsMutation.isPending}
                className="flex-1 bronze-gradient text-white hover:shadow-lg transition-all duration-300"
              >
                {addSkillsMutation.isPending 
                  ? "Adding Skills..." 
                  : `Add ${selectedSkills.length} Skills`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}