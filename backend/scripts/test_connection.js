import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || '6ac08445000e533e223f';

console.log('📡 Testing Appwrite Cloud Connectivity...');
console.log(`Endpoint:   ${endpoint}`);
console.log(`Project ID: ${projectId}`);

const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

async function testConnection() {
  try {
    const res = await fetch(`${endpoint}/health`);
    const data = await res.json();
    console.log('✅ Appwrite Cloud Server Health:', data);
    console.log('🎉 Connectivity verified successfully!');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testConnection();
