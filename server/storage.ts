import { 
  teams, challenges, photos, users, facebookAlbums, facebookPhotos,
  type Team, type InsertTeam, 
  type Challenge, type InsertChallenge,
  type Photo, type InsertPhoto,
  type User, type InsertUser,
  type FacebookAlbum, type InsertFacebookAlbum,
  type FacebookPhoto, type InsertFacebookPhoto
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Team methods
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  getTeamByCode(code: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  
  // Challenge methods
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // Photo methods
  getPhotos(): Promise<Photo[]>;
  getPhotosByTeam(teamId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhotoStatus(id: number, status: string, notes?: string): Promise<Photo | undefined>;
  
  // Facebook Albums methods
  getFacebookAlbums(): Promise<FacebookAlbum[]>;
  getFacebookAlbum(id: number): Promise<FacebookAlbum | undefined>;
  createFacebookAlbum(album: InsertFacebookAlbum): Promise<FacebookAlbum>;
  
  // Facebook Photos methods
  getFacebookPhotos(albumId: number): Promise<FacebookPhoto[]>;
  createFacebookPhoto(photo: InsertFacebookPhoto): Promise<FacebookPhoto>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teamsMap: Map<number, Team>;
  private challengesMap: Map<number, Challenge>;
  private photosMap: Map<number, Photo>;
  private facebookAlbumsMap: Map<number, FacebookAlbum>;
  private facebookPhotosMap: Map<number, FacebookPhoto>;
  
  private currentUserId: number;
  private currentTeamId: number;
  private currentChallengeId: number;
  private currentPhotoId: number;
  private currentFacebookAlbumId: number;
  private currentFacebookPhotoId: number;

  constructor() {
    this.users = new Map();
    this.teamsMap = new Map();
    this.challengesMap = new Map();
    this.photosMap = new Map();
    this.facebookAlbumsMap = new Map();
    this.facebookPhotosMap = new Map();
    
    this.currentUserId = 1;
    this.currentTeamId = 1;
    this.currentChallengeId = 1;
    this.currentPhotoId = 1;
    this.currentFacebookAlbumId = 1;
    this.currentFacebookPhotoId = 1;
    
    // Initialize with demo data
    this.initializeData();
  }

  private initializeData() {
    // Add demo teams
    const demoTeams = [
      {
        name: 'Bébittes moniteur',
        code: 'TEAM01',
        captain: 'Mishell Gauthier',
        email: 'michel.gauthier.104@facebook.com',
        phone: '418-555-0001',
        score: 82,
        logo: '',
      },
      {
        name: 'Bestioles monitrice',
        code: 'TEAM02',
        captain: 'Sandra Brasseur Jeffrey',
        email: 'sandra.b.jeffrey@facebook.com',
        phone: '418-555-0002',
        score: 62,
        logo: '',
      },
      {
        name: 'Shipshaw B&C',
        code: 'TEAM03',
        captain: 'Véronique Jacques',
        email: 'orev.jack@facebook.com',
        phone: '418-555-0003',
        score: 60,
        logo: '',
      },
      {
        name: 'Barbus',
        code: 'TEAM04',
        captain: 'Karen Bouchard',
        email: 'sadio.simaga@facebook.com',
        phone: '418-555-0004',
        score: 59,
        logo: '',
      },
      {
        name: 'Chiens de Brosse',
        code: 'TEAM05',
        captain: 'Sylvain Giroux',
        email: 'girouxsly@facebook.com',
        phone: '418-555-0005',
        score: 59,
        logo: '',
      },
    ];

    demoTeams.forEach(team => {
      this.createTeam(team);
    });

    // Add demo challenges
    const demoChallenges = [
      {
        name: 'Départ – RPM Harley-Davidson',
        description: 'Photo de départ devant RPM H-D',
        coordsLat: '48.4175',
        coordsLng: '-71.0591',
        type: 'défi',
        points: 10
      },
      {
        name: 'Cornhole – Roco Bar',
        description: 'Lancer de poches chez Pascal au Roco',
        coordsLat: '48.4305',
        coordsLng: '-71.0568',
        type: 'défi',
        points: 15
      },
      {
        name: 'Cerceau – A&W Arvida',
        description: 'Défi du cerceau synchronisé',
        coordsLat: '48.4128',
        coordsLng: '-71.0662',
        type: 'défi',
        points: 20
      },
      {
        name: 'Photo officielle – Mont Jacob',
        description: 'Votre plus beau sourire officiel avec le photographe',
        coordsLat: '48.4299',
        coordsLng: '-71.0577',
        type: 'photo',
        points: 10
      },
      {
        name: 'Yoga Ball – Gym',
        description: 'Défi d\'équilibre et de folie',
        coordsLat: '48.4201',
        coordsLng: '-71.0499',
        type: 'défi',
        points: 15
      },
      {
        name: 'Plage – Jonquière',
        description: 'Photo originale sur le sable',
        coordsLat: '48.4165',
        coordsLng: '-71.0300',
        type: 'photo',
        points: 12
      },
    ];

    demoChallenges.forEach(challenge => {
      this.createChallenge(challenge);
    });

    // Create a sample photo for testing
    this.createPhoto({
      teamId: 1,
      challengeId: 1,
      photoUrl: "https://example.com/sample-photo.jpg",
      status: "approved",
      notes: "Great team photo!"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Team methods
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teamsMap.values());
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teamsMap.get(id);
  }

  async getTeamByCode(code: string): Promise<Team | undefined> {
    return Array.from(this.teamsMap.values()).find(
      (team) => team.code === code,
    );
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const team: Team = { 
      ...insertTeam, 
      id,
      score: insertTeam.score || null,
      logo: insertTeam.logo || null
    };
    this.teamsMap.set(id, team);
    return team;
  }

  async updateTeam(id: number, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const team = this.teamsMap.get(id);
    if (!team) return undefined;
    
    const updatedTeam: Team = { ...team, ...teamUpdate };
    this.teamsMap.set(id, updatedTeam);
    return updatedTeam;
  }

  // Challenge methods
  async getChallenges(): Promise<Challenge[]> {
    return Array.from(this.challengesMap.values());
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challengesMap.get(id);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.currentChallengeId++;
    const challenge: Challenge = { 
      ...insertChallenge, 
      id,
      points: insertChallenge.points || null
    };
    this.challengesMap.set(id, challenge);
    return challenge;
  }

  // Photo methods
  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photosMap.values());
  }

  async getPhotosByTeam(teamId: number): Promise<Photo[]> {
    return Array.from(this.photosMap.values()).filter(
      (photo) => photo.teamId === teamId,
    );
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const now = new Date();
    const photo: Photo = { 
      ...insertPhoto, 
      id, 
      createdAt: now,
      status: insertPhoto.status || null,
      notes: insertPhoto.notes || null
    };
    this.photosMap.set(id, photo);
    return photo;
  }

  async updatePhotoStatus(id: number, status: string, notes?: string): Promise<Photo | undefined> {
    const photo = this.photosMap.get(id);
    if (!photo) return undefined;
    
    const updatedPhoto: Photo = { 
      ...photo, 
      status,
      notes: notes || photo.notes
    };
    
    this.photosMap.set(id, updatedPhoto);
    return updatedPhoto;
  }
  
  // Facebook Albums methods
  async getFacebookAlbums(): Promise<FacebookAlbum[]> {
    return Array.from(this.facebookAlbumsMap.values());
  }

  async getFacebookAlbum(id: number): Promise<FacebookAlbum | undefined> {
    return this.facebookAlbumsMap.get(id);
  }

  async createFacebookAlbum(insertAlbum: InsertFacebookAlbum): Promise<FacebookAlbum> {
    const id = this.currentFacebookAlbumId++;
    const now = new Date();
    const album: FacebookAlbum = { 
      ...insertAlbum, 
      id,
      createdAt: now,
      description: insertAlbum.description || null
    };
    this.facebookAlbumsMap.set(id, album);
    return album;
  }

  // Facebook Photos methods
  async getFacebookPhotos(albumId: number): Promise<FacebookPhoto[]> {
    return Array.from(this.facebookPhotosMap.values()).filter(
      (photo) => photo.albumId === albumId
    );
  }

  async createFacebookPhoto(insertPhoto: InsertFacebookPhoto): Promise<FacebookPhoto> {
    const id = this.currentFacebookPhotoId++;
    const now = new Date();
    const photo: FacebookPhoto = { 
      ...insertPhoto, 
      id,
      createdAt: now,
      caption: insertPhoto.caption || null
    };
    this.facebookPhotosMap.set(id, photo);
    return photo;
  }
}

// Import the database storage
import { dbStorage } from './db-storage';

// Export the database storage as the default storage
export const storage = dbStorage;
