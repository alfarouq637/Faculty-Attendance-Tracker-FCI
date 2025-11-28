import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import QRCode from 'react-qr-code';
import { RefreshCw, Play, StopCircle } from 'lucide-react';
import { Session } from '../types';

export const LecturerSession: React.FC = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string>('0000');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Rotate token every 10 seconds
  useEffect(() => {
    let interval: any;
    if (isSessionActive && sessionId) {
      interval = setInterval(async () => {
        const newToken = Math.floor(1000 + Math.random() * 9000).toString();
        setToken(newToken);
        // Update in Firestore so students can validate
        await db.collection('sessions').doc(sessionId).update({ currentToken: newToken });
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionId]);

  const startSession = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const loc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setLocation(loc);

      const newSession: Partial<Session> = {
        lecturerId: user?.uid,
        courseId: 'COURSE_001', // Should be selected from dropdown
        startTime: Date.now(),
        isActive: true,
        location: loc,
        radius: 50,
        currentToken: token
      };

      const docRef = await db.collection('sessions').add(newSession);
      setSessionId(docRef.id);
      setIsSessionActive(true);
    });
  };

  const endSession = async () => {
    if (sessionId) {
      await db.collection('sessions').doc(sessionId).update({ isActive: false });
      setIsSessionActive(false);
      setSessionId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        {!isSessionActive ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-suez-primary">إعداد جلسة جديدة</h2>
            <p className="text-gray-500">سيتم استخدام موقعك الحالي كمركز لنطاق الحضور.</p>
            <button
              onClick={startSession}
              className="bg-suez-primary text-white text-lg px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Play fill="currentColor" /> ابدأ المحاضرة
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                الجلسة نشطة
              </h2>
              <button onClick={endSession} className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
                <StopCircle /> إنهاء
              </button>
            </div>

            <div className="bg-white p-4 inline-block rounded-xl border-4 border-suez-secondary">
              <QRCode value={token} size={256} />
            </div>

            <div className="bg-gray-100 p-6 rounded-xl">
              <p className="text-gray-500 mb-2">رمز التحقق الحالي</p>
              <p className="text-6xl font-mono font-bold tracking-widest text-suez-primary">{token}</p>
              <div className="mt-4 flex justify-center items-center gap-2 text-sm text-gray-400">
                <RefreshCw size={14} className="animate-spin" />
                يتغير الرمز كل 10 ثواني
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};