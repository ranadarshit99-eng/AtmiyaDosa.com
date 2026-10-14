import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || '6ac08445000e533e223f';
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || '6ac0a4ee002d013a18f6';

console.log('🌱 Appwrite Database Initializer & Seeder');

if (!apiKey) {
  console.log('ℹ️ APPWRITE_API_KEY not provided in environment.');
  console.log('   The frontend uses Client SDK directly with public/authenticated guest permissions.');
  console.log('   To seed via server script, add APPWRITE_API_KEY to backend/.env');
  process.exit(0);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function seed() {
  try {
    console.log(`Checking Database: ${databaseId}...`);
    // Ensure Database exists
    try {
      await databases.get(databaseId);
      console.log(`✅ Database ${databaseId} found.`);
    } catch {
      await databases.create(databaseId, 'Hotel Management POS Database');
      console.log(`✅ Database ${databaseId} created.`);
    }

    console.log('🎉 Seeder completed successfully!');
  } catch (err) {
    console.error('❌ Seeder Error:', err.message);
  }
}

seed();
