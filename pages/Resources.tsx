import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import firebase from 'firebase/compat/app';
import { Folder, FileText, Link as LinkIcon, Plus } from 'lucide-react';
import { ResourceLink } from '../types';

export const Resources: React.FC = () => {
  const { profile } = useAuth();
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  // Mocking course ID for demo
  const courseId = 'COURSE_001';

  const fetchResources = async () => {
    const q = db.collection('resources').where('courseId', '==', courseId);
    const querySnapshot = await q.get();
    const res: any[] = [];
    querySnapshot.forEach((doc) => {
      res.push(doc.data());
    });
    setResources(res);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newUrl) {
      await db.collection('resources').add({
        courseId,
        title: newTitle,
        url: newUrl,
        addedBy: profile?.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setNewTitle('');
      setNewUrl('');
      setShowAdd(false);
      fetchResources();
    }
  };

  const isLecturer = profile?.role === 'lecturer' || profile?.role === 'super_admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-suez-primary flex items-center gap-2">
          <Folder className="text-suez-secondary" /> المصادر التعليمية
        </h2>
        {isLecturer && (
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="bg-suez-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-800"
          >
            <Plus size={16} /> إضافة رابط
          </button>
        )}
      </div>

      {isLecturer && showAdd && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
          <h3 className="font-bold mb-4">إضافة مصدر جديد (Google Drive)</h3>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="عنوان الملف / المجلد"
              className="p-3 border rounded-lg"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              type="url"
              placeholder="الرابط (URL)"
              className="p-3 border rounded-lg text-left"
              dir="ltr"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <button type="submit" className="bg-suez-secondary text-white py-2 rounded-lg font-bold">حفظ</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {resources.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا يوجد مصادر متاحة حالياً</p>
        ) : (
          resources.map((res, idx) => (
            <a 
              key={idx} 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-r-4 border-suez-primary flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{res.title}</h4>
                  <p className="text-xs text-gray-400">انقر للفتح</p>
                </div>
              </div>
              <LinkIcon size={16} className="text-gray-300 group-hover:text-suez-secondary" />
            </a>
          ))
        )}
      </div>
    </div>
  );
};