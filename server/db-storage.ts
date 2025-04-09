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
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Team methods
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(desc(teams.score));
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getTeamByCode(code: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.code, code));
    return team;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values({
      ...insertTeam,
      score: insertTeam.score || 0,
      logo: insertTeam.logo || ''
    }).returning();
    return team;
  }

  async updateTeam(id: number, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set(teamUpdate)
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  }

  // Challenge methods
  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db
      .insert(challenges)
      .values({
        ...insertChallenge,
        points: insertChallenge.points || 10
      })
      .returning();
    return challenge;
  }

  // Photo methods
  async getPhotos(): Promise<Photo[]> {
    return await db.select().from(photos).orderBy(desc(photos.createdAt));
  }

  async getPhotosByTeam(teamId: number): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.teamId, teamId))
      .orderBy(desc(photos.createdAt));
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db
      .insert(photos)
      .values({
        ...insertPhoto,
        status: insertPhoto.status || 'pending',
        notes: insertPhoto.notes || ''
      })
      .returning();
    return photo;
  }

  async updatePhotoStatus(id: number, status: string, notes?: string): Promise<Photo | undefined> {
    const updateData: { status: string; notes?: string } = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const [updatedPhoto] = await db
      .update(photos)
      .set(updateData)
      .where(eq(photos.id, id))
      .returning();
    return updatedPhoto;
  }

  // Facebook Albums methods
  async getFacebookAlbums(): Promise<FacebookAlbum[]> {
    return await db.select().from(facebookAlbums).orderBy(desc(facebookAlbums.createdAt));
  }

  async getFacebookAlbum(id: number): Promise<FacebookAlbum | undefined> {
    const [album] = await db.select().from(facebookAlbums).where(eq(facebookAlbums.id, id));
    return album;
  }

  async createFacebookAlbum(insertAlbum: InsertFacebookAlbum): Promise<FacebookAlbum> {
    const [album] = await db
      .insert(facebookAlbums)
      .values(insertAlbum)
      .returning();
    return album;
  }

  // Facebook Photos methods
  async getFacebookPhotos(albumId: number): Promise<FacebookPhoto[]> {
    return await db
      .select()
      .from(facebookPhotos)
      .where(eq(facebookPhotos.albumId, albumId))
      .orderBy(desc(facebookPhotos.createdAt));
  }

  async createFacebookPhoto(insertPhoto: InsertFacebookPhoto): Promise<FacebookPhoto> {
    const [photo] = await db
      .insert(facebookPhotos)
      .values(insertPhoto)
      .returning();
    return photo;
  }
}

// Initialize database with demo data
async function initializeDatabase() {
  try {
    // Check if we have any teams, if not seed the database
    const existingTeams = await db.select().from(teams);
    
    if (existingTeams.length === 0) {
      console.log("Initializing database with demo data...");
      
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

      const insertedTeams = await db.insert(teams).values(demoTeams).returning();
      console.log(`Added ${insertedTeams.length} demo teams.`);

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

      const insertedChallenges = await db.insert(challenges).values(demoChallenges).returning();
      console.log(`Added ${insertedChallenges.length} demo challenges.`);

      // Create a sample photo for testing
      await db.insert(photos).values({
        teamId: insertedTeams[0].id,
        challengeId: insertedChallenges[0].id,
        photoUrl: "https://example.com/sample-photo.jpg",
        status: "approved",
        notes: "Great team photo!"
      });
      console.log("Added sample photo.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export const dbStorage = new DatabaseStorage();
initializeDatabase().catch(console.error);