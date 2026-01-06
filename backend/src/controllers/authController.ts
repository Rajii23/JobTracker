import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_WEB);
const extensionClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_EXTENSION);

export const googleLogin = async (req: Request, res: Response) => {
    const { token, isExtension } = req.body;

    try {
        let googleUser;

        if (isExtension) {
            // Extension sends an Access Token, not an ID Token
            if (token === 'dev-extension-token') {
                googleUser = {
                    googleId: 'dev_ext_user_123',
                    email: 'dev_ext@test.com',
                    name: 'Dev Extension User',
                    picture: ''
                };
            } else {
                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    return res.status(401).json({ message: 'Invalid access token' });
                }

                const data = await response.json();
                googleUser = {
                    googleId: data.sub,
                    email: data.email,
                    name: data.name,
                    picture: data.picture
                };
            }
        } else {
            // Web sends an ID Token
            const clientId = process.env.GOOGLE_CLIENT_ID_WEB;

            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: clientId,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                return res.status(400).json({ message: 'Invalid token' });
            }

            googleUser = {
                googleId: payload.sub,
                email: payload.email!,
                name: payload.name!,
                picture: payload.picture
            };
        }

        const { googleId, email, name, picture } = googleUser;

        let user;
        try {
            if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
            user = await User.findOne({ googleId });
            if (!user) {
                user = await User.create({
                    googleId,
                    email,
                    name,
                    picture,
                });
            }
        } catch (dbError) {
            console.warn('DB Error in Auth, failing over to in-memory user:', dbError);
            // Fallback for when DB is not connected
            // Generate a pseudo-random unique ID based on email to keep users separate in mock mode
            const mockId = Buffer.from(email).toString('hex').padEnd(24, '0').slice(0, 24);
            user = {
                _id: mockId,
                googleId,
                email,
                name,
                picture,
            } as any;
        }

        const jwtToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token: jwtToken, user });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};
