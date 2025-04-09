import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  captain: text("captain").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  score: integer("score").default(0),
  logo: text("logo").default(''),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  coordsLat: text("coords_lat").notNull(),
  coordsLng: text("coords_lng").notNull(),
  type: text("type").notNull(), // 'défi' or 'photo'
  points: integer("points").default(10),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  photoUrl: text("photo_url").notNull(),
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected'
  notes: text("notes").default(''),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

// Albums Facebook
export const facebookAlbums = pgTable("facebook_albums", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image").notNull(),
  facebookUrl: text("facebook_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const facebookPhotos = pgTable("facebook_photos", {
  id: serial("id").primaryKey(),
  albumId: integer("album_id").references(() => facebookAlbums.id).notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFacebookAlbumSchema = createInsertSchema(facebookAlbums).omit({
  id: true,
  createdAt: true,
});

export const insertFacebookPhotoSchema = createInsertSchema(facebookPhotos).omit({
  id: true,
  createdAt: true,
});

export type InsertFacebookAlbum = z.infer<typeof insertFacebookAlbumSchema>;
export type FacebookAlbum = typeof facebookAlbums.$inferSelect;

export type InsertFacebookPhoto = z.infer<typeof insertFacebookPhotoSchema>;
export type FacebookPhoto = typeof facebookPhotos.$inferSelect;
