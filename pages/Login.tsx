import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Lock, LogIn, GraduationCap, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, login, promoteToSuperAdmin, loading } = useAuth();
  const [showSecret, setShowSecret] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <div className="h-screen flex items-center justify-center bg-suez-bg text-suez-primary">جاري التحميل...</div>;
  if (user) return <Navigate to="/" />;

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await promoteToSuperAdmin(secretKey);
    if (success) {
      alert("تم قبول المفتاح! يرجى تسجيل الدخول الآن لتفعيل الصلاحيات.");
      setSecretKey('');
      setShowSecret(false);
      // We don't redirect here, we let them click the login button
    } else {
      setError("المفتاح السري غير صحيح");
    }
  };

  return (
    <div className="min-h-screen bg-suez-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-suez-primary p-8 text-center text-white">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center text-suez-primary mb-4 shadow-lg">
             <GraduationCap size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-1">نظام الحضور الذكي</h2>
          <p className="text-blue-200">كلية الحاسبات والمعلومات - جامعة السويس</p>
        </div>

        <div className="p-8">
          <button
            onClick={login}
            className="w-full bg-suez-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-md mb-6"
          >
            <LogIn size={20} />
            <span>تسجيل الدخول باستخدام Google</span>
          </button>

          <div className="border-t border-gray-100 pt-6">
            <button 
              onClick={() => setShowSecret(!showSecret)}
              className="text-xs text-gray-400 hover:text-suez-primary flex items-center gap-1 mx-auto"
            >
              <Lock size={12} />
              <span>استرداد صلاحيات المسؤول</span>
            </button>

            {showSecret && (
              <form onSubmit={handleSecretSubmit} className="mt-4 animate-fade-in">
                <label className="block text-sm text-gray-600 mb-1">المفتاح السري (Master Key)</label>
                <div className="relative">
                  <input
                    type={isKeyVisible ? "text" : "password"}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-suez-secondary outline-none mb-2"
                    placeholder="أدخل المفتاح السري..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsKeyVisible(!isKeyVisible)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-suez-primary"
                  >
                    {isKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                <button 
                  type="submit"
                  className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-black mt-2"
                >
                  تفعيل الصلاحيات
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  سيتم تفعيل الصلاحيات تلقائياً عند تسجيل الدخول بعد إدخال المفتاح الصحيح.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};