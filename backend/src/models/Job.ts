import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    company: string;
    location?: string;
    url?: string;
    jdText?: string;
    resumeFile?: {
        filename: string;
        contentType: string;
        size: number;
        data: string; // base64 encoded file data
        uploadedAt: Date;
    };
    source: 'linkedin' | 'indeed' | 'glassdoor' | 'manual';
    status: 'applied' | 'interviewing' | 'offer' | 'rejected' | 'wishlist';
    dateApplied?: Date;
    notes: { text: string; date: Date }[];
    timeline: { type: string; text: string; date: Date }[];
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    url: { type: String },
    jdText: { type: String },
    resumeFile: {
        filename: { type: String },
        contentType: { type: String },
        size: { type: Number },
        data: { type: String }, // base64 encoded
        uploadedAt: { type: Date, default: Date.now }
    },
    source: { type: String, enum: ['linkedin', 'indeed', 'glassdoor', 'manual'], default: 'manual' },
    status: { type: String, enum: ['applied', 'interviewing', 'offer', 'rejected', 'wishlist'], default: 'wishlist', index: true },
    dateApplied: { type: Date },
    notes: [{
        text: String,
        date: { type: Date, default: Date.now }
    }],
    timeline: [{
        type: { type: String }, // e.g., 'status_change', 'note', 'interview'
        text: String,
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model<IJob>('Job', JobSchema);
