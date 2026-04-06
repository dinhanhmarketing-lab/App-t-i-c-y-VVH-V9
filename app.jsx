import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  Calendar, Users, Settings, ChevronLeft, ChevronRight, 
  Trash2, Plus, Leaf, Droplets, Upload, CheckCircle2, 
  X, Globe, History, TrendingUp, ChevronDown, Trophy, 
  Medal, Award, Crown, Star 
} from 'lucide-react';

// --- 1. CẤU HÌNH FIREBASE (THAY BẰNG THÔNG TIN THẬT CỦA BẠN TẠI ĐÂY) ---
const firebaseConfig = {
  apiKey: "AIzaSy...", // Thay bằng API Key thật
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'watering-team-app';

// --- UTILS ---
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const isToday = (date) => {
  const t = new Date();
  return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('loading');
  const [calendarTitle, setCalendarTitle] = useState('');
  const [members, setMembers] = useState([]);
  const [epochDate, setEpochDate] = useState(null);
  const [wateringDaysOverride, setWateringDaysOverride] = useState({});
  const [swaps, setSwaps] = useState({});
  const [completed, setCompleted] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberTeam, setNewMemberTeam] = useState('');

  // AUTH
  useEffect(() => {
    signInAnonymously(auth);
    return onAuthStateChanged(auth, (u) => { if (u) setUser(u); });
  }, []);

  // SYNC DATA
  useEffect(() => {
    if (!user) return;
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
    const unsubConfig = onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setCalendarTitle(d.title || '');
        setMembers(d.members || []);
        if (d.epochDate) setEpochDate(new Date(d.epochDate));
        setStep(d.members?.length > 0 ? 'dashboard' : 'setup');
      } else { setStep('setup'); }
      setLoading(false);
    });
    return () => unsubConfig();
  }, [user]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const updated = [...members, { id: Date.now().toString(), name: newMemberName, team: newMemberTeam }];
    setMembers(updated);
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
    await setDoc(ref, { members: updated, title: calendarTitle, epochDate: Date.now() }, { merge: true });
    setNewMemberName('');
    setNewMemberTeam('');
    setStep('dashboard');
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Đang tải dữ liệu...</div>;

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Thiết lập App Tưới Cây</h1>
          <form onSubmit={handleAddMember} className="space-y-4">
            <input type="text" placeholder="Tên dự án..." className="w-full p-3 border rounded-xl" value={calendarTitle} onChange={e => setCalendarTitle(e.target.value)} />
            <input type="text" placeholder="Tên thành viên..." className="w-full p-3 border rounded-xl" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
            <input type="text" placeholder="Team..." className="w-full p-3 border rounded-xl" value={newMemberTeam} onChange={e => setNewMemberTeam(e.target.value)} />
            <button className="w-full bg-emerald-500 text-white p-3 rounded-xl font-bold">BẮT ĐẦU</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-emerald-600">{calendarTitle || "Lịch Tưới Cây"}</h1>
          <div className="text-sm font-bold text-slate-400">{currentDate.getMonth() + 1} / {currentDate.getFullYear()}</div>
        </header>
        
        <div className="grid grid-cols-7 gap-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d} className="text-center text-xs font-bold text-slate-400">{d}</div>)}
          {/* Calendar Logic đơn giản */}
          {[...Array(31)].map((_, i) => (
            <div key={i} className="aspect-square border rounded-xl flex items-center justify-center font-bold text-slate-400 hover:bg-emerald-50">
              {i + 1}
            </div>
          ))}
        </div>
        
        <button onClick={() => setStep('setup')} className="mt-8 text-xs text-slate-300 hover:text-emerald-500 transition-colors">Thiết lập lại hệ thống</button>
      </div>
    </div>
  );
}
