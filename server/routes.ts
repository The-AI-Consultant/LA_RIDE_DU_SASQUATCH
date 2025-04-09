import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTeamSchema, 
  insertChallengeSchema, 
  insertPhotoSchema,
  insertFacebookAlbumSchema,
  insertFacebookPhotoSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer storage
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'client', 'public', 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage: storage_config,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max size
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all teams
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Get team by code
  app.get("/api/teams/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const team = await storage.getTeamByCode(code);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Get team by ID
  app.get("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getTeam(id);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Create a new team
  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const newTeam = await storage.createTeam(teamData);
      res.status(201).json(newTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  // Update team score
  app.patch("/api/teams/:id/score", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { score } = req.body;
      
      if (typeof score !== 'number') {
        return res.status(400).json({ message: "Score must be a number" });
      }
      
      const updatedTeam = await storage.updateTeam(id, { score });
      
      if (!updatedTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ message: "Failed to update team score" });
    }
  });

  // Get all challenges
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Get challenge by ID
  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const challenge = await storage.getChallenge(id);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  // Create a new challenge
  app.post("/api/challenges", async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      const newChallenge = await storage.createChallenge(challengeData);
      res.status(201).json(newChallenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid challenge data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  // Get all photos
  app.get("/api/photos", async (req, res) => {
    try {
      const photos = await storage.getPhotos();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Get photos by team ID
  app.get("/api/teams/:teamId/photos", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const photos = await storage.getPhotosByTeam(teamId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team photos" });
    }
  });

  // Create a new photo (JSON endpoint, still used for compatibility)
  app.post("/api/photos", async (req, res) => {
    try {
      const photoData = insertPhotoSchema.parse(req.body);
      const newPhoto = await storage.createPhoto(photoData);
      res.status(201).json(newPhoto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid photo data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create photo" });
    }
  });
  
  // Upload photo endpoint with file upload
  app.post("/api/upload-photo", upload.single('photo'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No photo uploaded" });
      }
      
      const { teamId, challengeId } = req.body;
      
      if (!teamId || !challengeId) {
        return res.status(400).json({ message: "Team ID and Challenge ID are required" });
      }
      
      // Create relative URL for the uploaded file (to be served from public folder)
      const photoUrl = `/uploads/${path.basename(file.path)}`;
      
      const photoData = {
        teamId: parseInt(teamId),
        challengeId: parseInt(challengeId),
        photoUrl,
        status: 'pending',
        notes: req.body.notes || ''
      };
      
      const newPhoto = await storage.createPhoto(photoData);
      res.status(201).json(newPhoto);
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Update photo status
  app.patch("/api/photos/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      if (typeof status !== 'string' || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'pending', 'approved', or 'rejected'" });
      }
      
      const updatedPhoto = await storage.updatePhotoStatus(id, status, notes);
      
      if (!updatedPhoto) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.json(updatedPhoto);
    } catch (error) {
      res.status(500).json({ message: "Failed to update photo status" });
    }
  });

  // Facebook Albums API endpoints
  app.get("/api/facebook/albums", async (req, res) => {
    try {
      const albums = await storage.getFacebookAlbums();
      res.json(albums);
    } catch (error) {
      console.error("Error fetching Facebook albums:", error);
      res.status(500).json({ message: "Failed to fetch Facebook albums" });
    }
  });

  app.get("/api/facebook/albums/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const album = await storage.getFacebookAlbum(id);
      
      if (!album) {
        return res.status(404).json({ message: "Facebook album not found" });
      }
      
      res.json(album);
    } catch (error) {
      console.error("Error fetching Facebook album:", error);
      res.status(500).json({ message: "Failed to fetch Facebook album" });
    }
  });

  app.post("/api/facebook/albums", async (req, res) => {
    try {
      const albumData = insertFacebookAlbumSchema.parse(req.body);
      const newAlbum = await storage.createFacebookAlbum(albumData);
      res.status(201).json(newAlbum);
    } catch (error) {
      console.error("Error creating Facebook album:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Facebook album data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Facebook album" });
    }
  });

  // Facebook Photos API endpoints
  app.get("/api/facebook/albums/:albumId/photos", async (req, res) => {
    try {
      const albumId = parseInt(req.params.albumId);
      const photos = await storage.getFacebookPhotos(albumId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching Facebook album photos:", error);
      res.status(500).json({ message: "Failed to fetch Facebook album photos" });
    }
  });

  app.post("/api/facebook/photos", async (req, res) => {
    try {
      const photoData = insertFacebookPhotoSchema.parse(req.body);
      const newPhoto = await storage.createFacebookPhoto(photoData);
      res.status(201).json(newPhoto);
    } catch (error) {
      console.error("Error creating Facebook photo:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Facebook photo data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Facebook photo" });
    }
  });

  // Facebook album cover image upload endpoint
  app.post("/api/facebook/albums/cover-upload", upload.single('coverImage'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No cover image uploaded" });
      }
      
      const { name, description, facebookUrl } = req.body;
      
      if (!name || !facebookUrl) {
        return res.status(400).json({ message: "Name and Facebook URL are required" });
      }
      
      // Create relative URL for the uploaded file (to be served from public folder)
      const coverImage = `/uploads/${path.basename(file.path)}`;
      
      const albumData = {
        name,
        description: description || null,
        coverImage,
        facebookUrl
      };
      
      const newAlbum = await storage.createFacebookAlbum(albumData);
      res.status(201).json(newAlbum);
    } catch (error) {
      console.error("Error uploading Facebook album cover:", error);
      res.status(500).json({ message: "Failed to upload Facebook album cover" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
