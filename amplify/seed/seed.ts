import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../data/resource';
import config from '../../amplify_outputs.json';

Amplify.configure(config);
const client = generateClient<Schema>();

export async function run() {
  try {
    console.log('🚀 Starting Mars crops seeding...');
    
    // Create Lettuce crop
    const lettuce = await client.models.Crop.create({
      name: 'Lettuce',
      health: 85,
      water: 70,
      temp: 20,
      humidity: 60,
      yieldKg: 4.0,
      missionDay: 450
    });
    console.log('✅ Lettuce created:', lettuce);

    // Create Potatoes crop
    const potatoes = await client.models.Crop.create({
      name: 'Potatoes',
      health: 92,
      water: 35,
      temp: 18,
      humidity: 70,
      yieldKg: 6.5,
      missionDay: 450
    });
    console.log('✅ Potatoes created:', potatoes);

    console.log('🌱 Mars crops seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding crops:', error);
    throw error;
  }
}
