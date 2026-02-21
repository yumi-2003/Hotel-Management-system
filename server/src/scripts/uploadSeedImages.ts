import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imagesToUpload = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
  'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800',
  'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800',
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1544124499-58ec52cf3de3?w=800',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
  'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
];

async function uploadImages() {
  console.log(' Starting image migration to Cloudinary...');
  const results: Record<string, string> = {};

  for (const url of imagesToUpload) {
    try {
      console.log(`Uploading: ${url}`);
      const result = await cloudinary.uploader.upload(url, {
        folder: 'comftay/seed_rooms',
      });
      results[url] = result.secure_url;
      console.log(` Success: ${result.secure_url}`);
    } catch (error) {
      console.error(` Failed to upload ${url}:`, error);
    }
  }

  console.log('\n Migration Complete! Mapping:');
  console.log(JSON.stringify(results, null, 2));
}

uploadImages();
