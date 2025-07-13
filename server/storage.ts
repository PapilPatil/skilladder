import { 
  users, 
  skills, 
  endorsements, 
  achievements,
  type User, 
  type InsertUser,
  type Skill,
  type InsertSkill,
  type Endorsement,
  type InsertEndorsement,
  type Achievement,
  type InsertAchievement
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Skill operations
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByUserId(userId: number): Promise<Skill[]>;
  getAllSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, updates: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;

  // Endorsement operations
  getEndorsement(id: number): Promise<Endorsement | undefined>;
  getEndorsementsBySkillId(skillId: number): Promise<Endorsement[]>;
  getEndorsementsByUserId(userId: number): Promise<Endorsement[]>;
  getEndorsementsForUser(userId: number): Promise<Endorsement[]>;
  createEndorsement(endorsement: InsertEndorsement): Promise<Endorsement>;
  deleteEndorsement(id: number): Promise<boolean>;

  // Achievement operations
  getAchievementsByUserId(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private endorsements: Map<number, Endorsement>;
  private achievements: Map<number, Achievement>;
  private currentUserId: number;
  private currentSkillId: number;
  private currentEndorsementId: number;
  private currentAchievementId: number;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.endorsements = new Map();
    this.achievements = new Map();
    this.currentUserId = 1;
    this.currentSkillId = 1;
    this.currentEndorsementId = 1;
    this.currentAchievementId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const sampleUsers = [
      { username: "john_doe", email: "john@company.com", name: "John Doe", role: "Software Engineer", level: 5, points: 1250 },
      { username: "sarah_johnson", email: "sarah@company.com", name: "Sarah Johnson", role: "Frontend Developer", level: 4, points: 980 },
      { username: "michael_chen", email: "michael@company.com", name: "Michael Chen", role: "Backend Developer", level: 3, points: 720 },
      { username: "emma_wilson", email: "emma@company.com", name: "Emma Wilson", role: "Project Manager", level: 6, points: 1450 },
      { username: "david_kumar", email: "david@company.com", name: "David Kumar", role: "DevOps Engineer", level: 4, points: 890 },
    ];

    sampleUsers.forEach(user => {
      const id = this.currentUserId++;
      this.users.set(id, { ...user, id, avatar: null });
    });

    // Create sample skills
    const sampleSkills = [
      { userId: 1, name: "JavaScript", category: "Technical", proficiency: "Expert", endorsementCount: 12 },
      { userId: 1, name: "React", category: "Technical", proficiency: "Advanced", endorsementCount: 8 },
      { userId: 1, name: "Node.js", category: "Technical", proficiency: "Intermediate", endorsementCount: 5 },
      { userId: 1, name: "Leadership", category: "Soft Skills", proficiency: "Expert", endorsementCount: 15 },
      { userId: 1, name: "Communication", category: "Soft Skills", proficiency: "Expert", endorsementCount: 11 },
      { userId: 1, name: "Project Management", category: "Soft Skills", proficiency: "Advanced", endorsementCount: 9 },
      { userId: 2, name: "React", category: "Technical", proficiency: "Expert", endorsementCount: 14 },
      { userId: 2, name: "Vue.js", category: "Technical", proficiency: "Advanced", endorsementCount: 7 },
      { userId: 2, name: "UI/UX Design", category: "Technical", proficiency: "Advanced", endorsementCount: 10 },
      { userId: 3, name: "Node.js", category: "Technical", proficiency: "Expert", endorsementCount: 16 },
      { userId: 3, name: "Python", category: "Technical", proficiency: "Advanced", endorsementCount: 9 },
      { userId: 3, name: "AWS", category: "Technical", proficiency: "Intermediate", endorsementCount: 6 },
      { userId: 4, name: "Agile", category: "Soft Skills", proficiency: "Expert", endorsementCount: 18 },
      { userId: 4, name: "Scrum", category: "Soft Skills", proficiency: "Expert", endorsementCount: 15 },
      { userId: 4, name: "Leadership", category: "Soft Skills", proficiency: "Expert", endorsementCount: 20 },
    ];

    sampleSkills.forEach(skill => {
      const id = this.currentSkillId++;
      this.skills.set(id, { ...skill, id, createdAt: new Date(), source: "manual" });
    });

    // Create sample endorsements
    const sampleEndorsements = [
      { skillId: 1, endorserId: 2, endorseeId: 1, comment: "John's JavaScript expertise is exceptional. He consistently delivers high-quality code." },
      { skillId: 4, endorserId: 3, endorseeId: 1, comment: "Great team leader with excellent communication skills." },
      { skillId: 7, endorserId: 1, endorseeId: 2, comment: "Sarah's React skills are top-notch. She creates amazing user interfaces." },
      { skillId: 10, endorserId: 2, endorseeId: 3, comment: "Michael's backend development skills are impressive." },
    ];

    sampleEndorsements.forEach(endorsement => {
      const id = this.currentEndorsementId++;
      this.endorsements.set(id, { ...endorsement, id, createdAt: new Date() });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, level: 1, points: 0, avatar: null };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Skill operations
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async getSkillsByUserId(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.userId === userId);
  }

  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.currentSkillId++;
    const skill: Skill = { 
      ...insertSkill, 
      id, 
      endorsementCount: 0,
      createdAt: new Date(),
      source: insertSkill.source || "manual"
    };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkill(id: number, updates: Partial<Skill>): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...updates };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Endorsement operations
  async getEndorsement(id: number): Promise<Endorsement | undefined> {
    return this.endorsements.get(id);
  }

  async getEndorsementsBySkillId(skillId: number): Promise<Endorsement[]> {
    return Array.from(this.endorsements.values()).filter(endorsement => endorsement.skillId === skillId);
  }

  async getEndorsementsByUserId(userId: number): Promise<Endorsement[]> {
    return Array.from(this.endorsements.values()).filter(endorsement => endorsement.endorserId === userId);
  }

  async getEndorsementsForUser(userId: number): Promise<Endorsement[]> {
    return Array.from(this.endorsements.values()).filter(endorsement => endorsement.endorseeId === userId);
  }

  async createEndorsement(insertEndorsement: InsertEndorsement): Promise<Endorsement> {
    const id = this.currentEndorsementId++;
    const endorsement: Endorsement = { 
      ...insertEndorsement, 
      id, 
      createdAt: new Date(),
      comment: insertEndorsement.comment || null
    };
    this.endorsements.set(id, endorsement);

    // Update skill endorsement count
    const skill = this.skills.get(insertEndorsement.skillId);
    if (skill) {
      skill.endorsementCount++;
      this.skills.set(skill.id, skill);
    }

    return endorsement;
  }

  async deleteEndorsement(id: number): Promise<boolean> {
    const endorsement = this.endorsements.get(id);
    if (!endorsement) return false;

    const deleted = this.endorsements.delete(id);
    if (deleted) {
      // Update skill endorsement count
      const skill = this.skills.get(endorsement.skillId);
      if (skill && skill.endorsementCount > 0) {
        skill.endorsementCount--;
        this.skills.set(skill.id, skill);
      }
    }
    return deleted;
  }

  // Achievement operations
  async getAchievementsByUserId(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(achievement => achievement.userId === userId);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const achievement: Achievement = { 
      ...insertAchievement, 
      id, 
      createdAt: new Date(),
      points: insertAchievement.points || 0
    };
    this.achievements.set(id, achievement);

    // Update user points
    const user = this.users.get(insertAchievement.userId);
    if (user) {
      user.points += achievement.points;
      this.users.set(user.id, user);
    }

    return achievement;
  }
}

export const storage = new MemStorage();
