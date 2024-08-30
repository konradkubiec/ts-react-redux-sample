import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { PGlite} from '@electric-sql/pglite';
import * as schema from './schema';

// Initialize PGlite
const pglite = new PGlite();

// Create the database connection
export const db = drizzle(pglite, { schema });

// Run migrations
migrate( db, { migrationsFolder: './drizzle' });

console.log('Database connected and migrations applied');