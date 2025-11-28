import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import firebase from 'firebase/compat/app';
import { calculateDistance } from '../utils/location';
import { MapPin, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Session } from '../types';

export const StudentAttendance: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // 1. Get User Location High Accuracy
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Also verify accuracy
          if (position.coords.accuracy > 100) {
             setMessage("دقة الموقع GPS ضعيفة. يرجى الخروج لمكان مفتوح.");
          }
        },
        (error) => {
          console.error(error);
          setMessage("يرجى تفعيل خدمة الموقع (GPS) للمتابعة.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // 2. Fetch Active Session (Simplified: Gets the first active session found)
  // In a real app, this would filter by enrolled courses.
  useEffect(() => {
    const fetchSession = async () => {
      getLocation();
      const q = db.collection('sessions').where('isActive', '==', true);
      const querySnapshot = await q.get();
      if (!querySnapshot.empty) {
        const sessionData = querySnapshot.docs[0].data() as Session;
        setActiveSession({ ...sessionData, id: querySnapshot.docs[0].id });
      } else {
        setMessage("لا توجد محاضرات نشطة حالياً.");
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  // 3. Calculate Distance periodically
  useEffect(() => {
    if (location && activeSession) {
      const dist = calculateDistance(
        location.lat,
        location.lng,
        activeSession.location.lat,
        activeSession.location.lng
      );
      setDistance(dist);
    }
  }, [location, activeSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !user || !profile || !location) return;

    if (distance && distance > activeSession.radius) {
      setStatus('error');
      setMessage(`أنت بعيد عن المدرج بمسافة ${Math.round(distance)} متر. الحد المسموح ${activeSession.radius} متر.`);
      return;
    }

    if (token !== activeSession.currentToken) {
      setStatus('error');
      setMessage("رمز التحقق (Token) غير صحيح أو منتهي الصلاحية.");
      return;
    }

    try {
      await db.collection('attendance_logs').add({
        sessionId: activeSession.id,
        studentId: user.uid,
        studentName: profile.displayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        location: location,
        verified: true
      });
      setStatus('success');
      setMessage("تم تسجيل الحضور بنجاح!");
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage("حدث خطأ أثناء التسجيل. ربما انتهى وقت المحاضرة.");
    }
  };

  if (loading) return <div className="p-8 text-center"><RefreshCw className="animate-spin mx-auto text-suez-primary" /></div>;

  if (!activeSession) return (
    <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm m-4">
      <p>{message || "لا توجد محاضرات نشطة"}</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-suez-primary font-bold">تحديث</button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-suez-primary p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-1">تسجيل الحضور</h2>
          <p className="opacity-90 text-sm">تأكد من تواجدك داخل القاعة</p>
        </div>

        <div className="p-6">
          {/* Status Indicator */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-full ${distance && distance < activeSession.radius ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                 <MapPin size={24} />
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-700">المسافة الحالية</p>
                 <p className="text-xs text-gray-500">
                   {distance ? `${Math.round(distance)} متر` : 'جاري تحديد الموقع...'}
                 </p>
               </div>
             </div>
             {distance && distance < activeSession.radius && (
               <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">في النطاق</span>
             )}
          </div>

          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">تم التسجيل!</h3>
              <p className="text-gray-500 mt-2">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">رمز الجلسة (من الشاشة)</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full text-center text-2xl tracking-widest p-4 border-2 border-gray-200 rounded-xl focus:border-suez-secondary focus:ring-0 outline-none font-mono"
                  placeholder="####"
                  maxLength={4}
                />
              </div>

              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <XCircle size={16} />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={!distance || distance > activeSession.radius}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all ${
                  !distance || distance > activeSession.radius
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-suez-secondary text-white hover:bg-yellow-500 active:scale-95'
                }`}
              >
                تأكيد الحضور
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};