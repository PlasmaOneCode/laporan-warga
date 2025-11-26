import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['lampu_mati', 'jalan_berlubang', 'sampah', 'hewan_liar'],
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'done', 'rejected'],
      default: 'open'
    },
    images: [{ type: String }],
    address: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    contact: { type: String },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
