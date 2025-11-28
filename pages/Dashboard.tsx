import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { QrCode, BookOpen, Users, BarChart, MapPin } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const Card = ({ title, icon: Icon, to, color }: { title: string, icon: any, to: string, color: string }) => (
    <Link to={to} className="block group">
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center justify-center gap-4 h-40">
        <div className={`p-4 rounded-full ${color} text-white group-hover:scale-110 transition-transform`}>
          <Icon size={32} />
        </div>
        <span className="font-bold text-gray-700 text-lg">{title}</span>
      </div>
    </Link>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-suez-primary mb-2">مرحباً، {profile.displayName}</h2>
        <p className="text-gray-500">لوحة التحكم الرئيسية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Student View */}
        {profile.role === 'student' && (
          <>
            <Card title="تسجيل الحضور" icon={QrCode} to="/attendance" color="bg-suez-primary" />
            <Card title="المقررات الدراسية" icon={BookOpen} to="/resources" color="bg-suez-secondary" />
          </>
        )}

        {/* Lecturer View */}
        {(profile.role === 'lecturer' || profile.role === 'super_admin') && (
          <>
            <Card title="بدء محاضرة جديدة" icon={MapPin} to="/lecturer/session" color="bg-suez-primary" />
            <Card title="إدارة المصادر" icon={BookOpen} to="/resources" color="bg-blue-600" />
            <Card title="تقارير الحضور" icon={BarChart} to="/lecturer/reports" color="bg-green-600" />
          </>
        )}

        {/* Admin/Super Admin View */}
        {(profile.role === 'admin' || profile.role === 'super_admin') && (
          <>
            <Card title="إدارة المستخدمين" icon={Users} to="/admin/users" color="bg-purple-600" />
            <Card title="إدارة المقررات" icon={BookOpen} to="/admin/courses" color="bg-orange-600" />
          </>
        )}
      </div>
    </div>
  );
};
