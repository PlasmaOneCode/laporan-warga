import asyncHandler from 'express-async-handler';
import Report from '../models/Report.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Helper to build base URL for images
const buildImageUrl = (req, filename) => {
  if (!filename) return null;

  const host = req.get('host');
  const protocol = req.protocol;
  return `${protocol}://${host}/uploads/${filename}`.replace(/\\/g, '/');
};

// GET /api/reports
export const listReports = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search, category, status } = req.query;
  page = Number(page);
  limit = Number(limit);

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) filter.category = category;
  if (status) filter.status = status;

  const total = await Report.countDocuments(filter);
  const data = await Report.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('submittedBy', 'name');

  // Convert images to full URLs
  const mapped = data.map((r) => ({
    _id: r._id,
    title: r.title,
    category: r.category,
    status: r.status,
    images: r.images.map((img) => buildImageUrl(req, img)),
    address: r.address,
    createdAt: r.createdAt,
    submittedBy: r.submittedBy
  }));

  res.json({ data: mapped, total, page, limit });
});

// GET /api/reports/stats
export const getStats = asyncHandler(async (req, res) => {
  const total = await Report.countDocuments();
  const statusCounts = await Report.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const byCategory = await Report.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const formatCounts = (arr) => {
    const map = { open: 0, in_progress: 0, done: 0, rejected: 0 };
    arr.forEach((i) => {
      map[i._id] = i.count;
    });
    return map;
  };

  const statuses = formatCounts(statusCounts);
  const categories = { lampu_mati: 0, jalan_berlubang: 0, sampah: 0, hewan_liar: 0 };
  byCategory.forEach((i) => (categories[i._id] = i.count));

  res.json({
    ...statuses,
    total,
    byCategory: categories
  });
});

// GET /api/reports/:id
export const getReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid id');
  }

  const report = await Report.findById(id).populate('submittedBy', 'name');
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  const mapped = {
    _id: report._id,
    title: report.title,
    description: report.description,
    category: report.category,
    status: report.status,
    images: report.images.map((img) => buildImageUrl(req, img)),
    address: report.address,
    lat: report.lat,
    lng: report.lng,
    contact: report.contact,
    createdAt: report.createdAt,
    submittedBy: report.submittedBy
  };

  res.json(mapped);
});

// POST /api/reports
export const createReport = asyncHandler(async (req, res) => {
  // Multer handled files in req.files
  const { title, description, category, address, lat, lng, contact } = req.body;
  const files = req.files || [];

  if (!title || !description || !category || !address) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  if (description.length < 10) {
    res.status(400);
    throw new Error('Description must be at least 10 characters');
  }

  if (!['lampu_mati', 'jalan_berlubang', 'sampah', 'hewan_liar'].includes(category)) {
    res.status(400);
    throw new Error('Invalid category');
  }

  if (files.length < 1 || files.length > 4) {
    res.status(400);
    throw new Error('Images count must be between 1 and 4');
  }

  const imageNames = files.map((f) => f.filename);
  const report = await Report.create({
    title,
    description,
    category,
    address,
    lat: lat ? Number(lat) : undefined,
    lng: lng ? Number(lng) : undefined,
    contact,
    images: imageNames,
    submittedBy: req.user._id
  });

  res.status(201).json({ ...report.toObject() });
});

// PUT /api/reports/:id
export const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, address, lat, lng, contact } = req.body;
  const files = req.files || [];

  const report = await Report.findById(id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Ownership is checked by middleware
  if (title) report.title = title;
  if (description) report.description = description;
  if (category) report.category = category;
  if (address) report.address = address;
  if (lat) report.lat = Number(lat);
  if (lng) report.lng = Number(lng);
  if (contact) report.contact = contact;

  const existingImagesFromBody = req.body.existingImages ? JSON.parse(req.body.existingImages) : null;
  const existingFilenames = Array.isArray(existingImagesFromBody) ? existingImagesFromBody.map((img) => {
    // if image is a full URL, extract the filename after '/uploads/'
    try {
      const parsed = img.includes('/uploads/') ? img.split('/uploads/').pop() : img;
      return parsed;
    } catch (err) {
      return img;
    }
  }) : null;

  if (files.length > 0) {
    // Replace images with uploaded files; remove all old images from disk
    try {
      const uploadPath = process.env.UPLOAD_PATH || 'uploads';
      report.images.forEach((imgName) => {
        const p = path.join(uploadPath, imgName);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
    } catch (err) {
      console.warn('Failed to remove old images', err.message);
    }
    report.images = files.map((f) => f.filename);
  } else if (Array.isArray(existingFilenames)) {
    // Keep only the images the user still wants; delete the ones removed
    try {
      const uploadPath = process.env.UPLOAD_PATH || 'uploads';
      const toRemove = report.images.filter((img) => !existingFilenames.includes(img));
      toRemove.forEach((imgName) => {
        const p = path.join(uploadPath, imgName);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
    } catch (err) {
      console.warn('Failed to remove some old images', err.message);
    }
    report.images = existingFilenames;
  }

  await report.save();

  res.json(report);
});

// PATCH /api/reports/:id/status
export const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['open', 'in_progress', 'done', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const report = await Report.findById(id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  report.status = status;
  await report.save();
  res.json(report);
});

// DELETE /api/reports/:id
export const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await Report.findById(id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Remove images from disk
  try {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads';
    report.images.forEach((imgName) => {
      const p = path.join(uploadPath, imgName);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  } catch (err) {
    console.warn('Failed to remove images', err.message);
  }

  await report.remove();

  res.json({ message: 'Laporan berhasil dihapus' });
});
