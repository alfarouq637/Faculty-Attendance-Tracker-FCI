import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-suez-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-suez-primary font-bold shadow-inner">
            FCI
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">كلية الحاسبات</h1>
            <p className="text-xs text-suez-secondary">جامعة السويس</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold">{profile?.displayName}</p>
            <p className="text-xs text-gray-300 flex items-center justify-end gap-1">
              {profile?.role === 'super_admin' && <Shield size={10} className="text-suez-secondary" />}
              {profile?.role === 'student' && 'طالب'}
              {profile?.role === 'lecturer' && 'محاضر'}
              {profile?.role === 'admin' && 'مسؤول'}
              {profile?.role === 'super_admin' && 'مسؤول نظاك'}
            </p>
          </div>
          <button 
            onClick={logout}
            className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};
