import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSkillSchema, insertEndorsementSchema, insertAchievementSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const skills = await storage.getSkillsByUserId(id);
      const endorsements = await storage.getEndorsementsForUser(id);
      const totalEndorsements = skills.reduce((sum, skill) => sum + skill.endorsementCount, 0);
      
      // Calculate rank based on points
      const allUsers = await storage.getAllUsers();
      const sortedUsers = allUsers.sort((a, b) => b.points - a.points);
      const rank = sortedUsers.findIndex(u => u.id === id) + 1;

      res.json({
        totalSkills: skills.length,
        totalEndorsements,
        points: user.points,
        level: user.level,
        rank
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Skill routes
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skills" });
    }
  });

  app.get("/api/skills/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const skills = await storage.getSkillsByUserId(userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user skills" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const validatedData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(validatedData);
      
      // Award points for adding a skill
      const user = await storage.getUser(validatedData.userId);
      if (user) {
        await storage.updateUser(user.id, { points: user.points + 10 });
      }

      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid skill data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create skill" });
      }
    }
  });

  app.post("/api/skills/bulk", async (req, res) => {
    try {
      const { skills } = req.body;
      
      if (!Array.isArray(skills)) {
        return res.status(400).json({ error: "Skills must be an array" });
      }

      const validatedSkills = skills.map(skill => insertSkillSchema.parse(skill));
      const createdSkills = await Promise.all(
        validatedSkills.map(skill => storage.createSkill(skill))
      );
      
      // Award points for bulk import
      if (validatedSkills.length > 0) {
        const userId = validatedSkills[0].userId;
        const user = await storage.getUser(userId);
        if (user) {
          const pointsToAward = validatedSkills.length * 10;
          await storage.updateUser(user.id, { points: user.points + pointsToAward });
        }
      }

      res.status(201).json(createdSkills);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid skill data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create skills" });
      }
    }
  });

  app.put("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const skill = await storage.updateSkill(id, updates);
      
      if (!skill) {
        return res.status(404).json({ error: "Skill not found" });
      }
      
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: "Failed to update skill" });
    }
  });

  app.delete("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSkill(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Skill not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete skill" });
    }
  });

  // Endorsement routes
  app.get("/api/endorsements/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const endorsements = await storage.getEndorsementsForUser(userId);
      
      // Get endorser details
      const endorsementsWithDetails = await Promise.all(
        endorsements.map(async (endorsement) => {
          const endorser = await storage.getUser(endorsement.endorserId);
          const skill = await storage.getSkill(endorsement.skillId);
          return {
            ...endorsement,
            endorser,
            skill
          };
        })
      );
      
      res.json(endorsementsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch endorsements" });
    }
  });

  app.get("/api/endorsements/skill/:skillId", async (req, res) => {
    try {
      const skillId = parseInt(req.params.skillId);
      const endorsements = await storage.getEndorsementsBySkillId(skillId);
      
      const endorsementsWithDetails = await Promise.all(
        endorsements.map(async (endorsement) => {
          const endorser = await storage.getUser(endorsement.endorserId);
          return {
            ...endorsement,
            endorser
          };
        })
      );
      
      res.json(endorsementsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skill endorsements" });
    }
  });

  app.post("/api/endorsements", async (req, res) => {
    try {
      const validatedData = insertEndorsementSchema.parse(req.body);
      const endorsement = await storage.createEndorsement(validatedData);
      
      // Award points for giving an endorsement
      const endorser = await storage.getUser(validatedData.endorserId);
      if (endorser) {
        await storage.updateUser(endorser.id, { points: endorser.points + 5 });
      }

      // Award points for receiving an endorsement
      const endorsee = await storage.getUser(validatedData.endorseeId);
      if (endorsee) {
        await storage.updateUser(endorsee.id, { points: endorsee.points + 15 });
      }

      res.status(201).json(endorsement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid endorsement data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create endorsement" });
      }
    }
  });

  // Achievement routes
  app.get("/api/achievements/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getAchievementsByUserId(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const validatedData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid achievement data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create achievement" });
      }
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard/endorsers", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const endorsersWithCounts = await Promise.all(
        users.map(async (user) => {
          const endorsements = await storage.getEndorsementsByUserId(user.id);
          return {
            ...user,
            endorsementCount: endorsements.length
          };
        })
      );
      
      const sortedEndorsers = endorsersWithCounts
        .sort((a, b) => b.endorsementCount - a.endorsementCount)
        .slice(0, 10);
      
      res.json(sortedEndorsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch endorser leaderboard" });
    }
  });

  app.get("/api/leaderboard/points", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sortedUsers = users
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);
      
      res.json(sortedUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch points leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
