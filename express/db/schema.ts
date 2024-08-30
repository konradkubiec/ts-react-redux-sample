import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel} from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

type SelectUser = typeof users.$inferSelect;
type InsertUser = typeof users.$inferInsert;


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Zod schema for inserting a new user
export const insertUserSchema = createInsertSchema(users, {
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
}).omit({ id: true, createdAt: true });

// Zod schema for selecting a user (excluding password)
export const selectUserSchema = createSelectSchema(users).omit({ password: true });

// Additional schema for registration form (including password confirmation)
export const registerFormUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

//TO DO: update to architecture.md