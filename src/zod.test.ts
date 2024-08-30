import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { pgEnum, pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { createHash } from 'crypto';
import {describe, expect, test, it, jest, beforeEach} from '@jest/globals';

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 30 }).notNull(),
    email: varchar('email', { length: 20 }).notNull(),
    password: varchar('password', { length: 25 }).notNull(),
    role: varchar('role', { enum: ['admin', 'user'] }).notNull().default('user'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    tokens: text('tokens').default('[]'), 
  });
  
  
  // Schema for selecting a user
  export const selectUserSchema = createSelectSchema(users, {
      password: schema => schema.password != null ? schema.password
          .transform( email => createHash('sha256').update(email + 'salt').digest('base64').slice(0, 20))
          : schema.password,
  })
  
  // Refining the fields in schema for inserting a user
  export const insertUserSchema = createInsertSchema(users, {
    id: (schema) => schema.id.positive(),
    name: (schema) => schema.name
      .min(2, 'Name must be at least 2 characters'),
    email: (schema) => schema.email.email(),
    password: (schema) => schema.password
      .min(6, 'Password must be at least 6 characters')
      .transform( email => createHash('sha256').update(email + 'salt').digest('base64').slice(0, 20)),
  });
  
  export const registerFormUserSchema = insertUserSchema
  .omit({ id: true })
  .extend({ confirmPassword: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(20, 'Password must be no longer than 20 characters')})
  .superRefine(({ password, confirmPassword }, ctx) => {
      if(password != confirmPassword){
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "The passwords did not match",
              path: ['confirmPassword']
          });
      }
  });

export const selectSelfSchema = selectUserSchema
  .pick({ name: true, email: true, password: true});

export type UserInput = z.infer<typeof insertUserSchema>;
export type UserOutput = z.infer<typeof selectUserSchema>;

const client = new PGlite();
// const db = drizzle(client);

  describe('add user', () => {
    it('should sanitise inputs and hash password', async () => {


        const result= insertUserSchema.safeParse({
            name: 'John Doe',
            email: 'johndoe@test.com',
            role: 'admin',
            password: '1234567890'
        });

        const user = result.data;
        expect(user).toBeDefined();

        if (!user) return;
        expect(user.password).toBe('ukOZef0oynB9TBuiuwsJ');

        //const result = await db.insert(users).values(user);
    });

    it('should return error when inputs are broken', async () => {


        const result= insertUserSchema.safeParse({
            name: '!@#John Doe"; DROP TABLE tooooo loooong;',
            email: 'johndoe.test.com',
            role: 'new',
            password: '123'
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();

        if(result.error == null) return;
        expect(result.error.issues).toBeDefined();
        //const result = await db.insert(users).values(user);
    });
});