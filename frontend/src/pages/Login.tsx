import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showDevBypass, setShowDevBypass] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            // Send the Google token to our backend
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
                token: credentialResponse.credential,
                isExtension: false
            });

            const { token, user } = response.data;

            // Store auth data
            login(token, user);

            // Redirect to dashboard
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        }
    };

    const handleGoogleError = () => {
        console.error('Google Login Failed');
        alert('Google Login Failed. Please try again.');
    };

    // TEMPORARY: Development bypass (remove in production)
    const handleDevBypass = () => {
        const devUser = {
            email: 'dev@test.com',
            name: 'Dev User',
            picture: ''
        };
        const devToken = 'dev-token-' + Date.now();
        login(devToken, devUser);
        navigate('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-[400px] shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-800">Job Tracker</CardTitle>
                    <CardDescription className="text-gray-600">
                        Track your job applications with ease
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 pt-4">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_blue"
                        size="large"
                        text="signin_with"
                    />

                    {/* Development Bypass */}
                    <div className="w-full border-t pt-4 mt-2">
                        {!showDevBypass ? (
                            <button
                                onClick={() => setShowDevBypass(true)}
                                className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
                            >
                                Development Mode
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 text-center">
                                    ⚠️ Waiting for Google OAuth? Use dev bypass:
                                </p>
                                <Button
                                    onClick={handleDevBypass}
                                    variant="outline"
                                    className="w-full text-sm"
                                >
                                    🔧 Skip to Dashboard (Dev Only)
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
