import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Report from './models/Report.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  // Clear collections
  await User.deleteMany({});
  await Report.deleteMany({});

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: adminPassword, role: 'admin' });
  const normalUser = await User.create({ name: 'User', email: 'user@test.com', password: userPassword, role: 'user' });

  // Sample reports
  const reports = [
    {
      title: 'Lampu mati di jalan A',
      description: 'Lampu di jalan A sudah padam selama seminggu',
      category: 'lampu_mati',
      address: 'Jalan A No 1',
      images: [],
      submittedBy: normalUser._id,
      status: 'open'
    },
    {
      title: 'Jalan berlubang di jalan B',
      description: 'Terdapat lubang besar di jalan B, berbahaya untuk kendaraan',
      category: 'jalan_berlubang',
      address: 'Jalan B No 2',
      images: [],
      submittedBy: normalUser._id,
      status: 'open'
    },
    {
      title: 'Sampah menumpuk di sungai',
      description: 'Tumpukan sampah mengganggu aliran sungai',
      category: 'sampah',
      address: 'Sungai C',
      images: [],
      submittedBy: adminUser._id,
      status: 'in_progress'
    }
  ];

  await Report.create(reports);

  console.log('Database seeded');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
