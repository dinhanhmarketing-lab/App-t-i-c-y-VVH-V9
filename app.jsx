import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, onSnapshot, updateDoc 
} from 'firebase/firestore';
import { 
  Calendar, Users, Settings, ChevronLeft, ChevronRight, 
  Trash2, Plus, Leaf, Droplets, Upload, CheckCircle2, 
  X, Globe, History, TrendingUp, ChevronDown, Trophy, 
  Medal, Award, Crown, Star 
} from 'lucide-react';

// --- 1. CẤU HÌNH FIREBASE (DÙNG THÔNG TIN TỪ HÌNH ẢNH CỦA BẠN) ---
const firebaseConfig = {
  apiKey: "AIzaSyC-HodBQeatCrJPLWcm96L6gLabVJVZKyw",
  authDomain: "app-tuoi-cay-vvh.firebaseapp.com",
  projectId: "app-tuoi-cay-vvh",
  storageBucket: "app-tuoi-cay-vvh.firebasestorage.app",
  messagingSenderId: "739614880511",
  appId: "1:739614880511:web:53d229597ec9969b50d2ca",
  measurementId: "G-343PBHZ7PB"
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

const getBadgeInfo = (count) => {
  if (count <= 3) return { label: "Người tưới cho có", color: "text-slate-400", bg: "bg-slate-100" };
  if (count <= 5) return { label: "Người tập tưới", color: "text-blue-500", bg: "bg-blue-50" };
  if (count <= 10) return { label: "Người tưới có tâm", color: "text-emerald-500", bg: "bg-emerald-50" };
  return { label: "Người tưới cả thế giới", color: "text-amber-500", bg: "bg-amber-50" };
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('loading');
  
  // App State
  const [calendarTitle, setCalendarTitle] = useState('');
  const [members, setMembers] = useState([]);
  const [epochDate, setEpochDate] = useState(null);
  const [completed, setCompleted] = useState({});

  // UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberTeam, setNewMemberTeam] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // AUTH
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Auth error:", err));
    return onAuthStateChanged(auth, (u) => { if (u) setUser(u); });
  }, []);

  // DATA SYNC
  useEffect(() => {
    if (!user) return;
    
    // Sync Settings
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCalendarTitle(data.title || '');
        setMembers(data.members || []);
        if (data.epochDate) setEpochDate(new Date(data.epochDate));
        setStep(data.members?.length > 0 ? 'dashboard' : 'setup');
      } else {
        setStep('setup');
      }
      setLoading(false);
    });

    // Sync Progress
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'main');
    const unsubSchedule = onSnapshot(scheduleRef, (docSnap) => {
      if (docSnap.exists()) {
        setCompleted(docSnap.data().completed || {});
      }
    });

    return () => { unsubConfig(); unsubSchedule(); };
  }, [user]);

  const handleStartApp = async () => {
    if (!calendarTitle || members.length === 0) return;
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
    await setDoc(configRef, {
      title: calendarTitle,
      members: members,
      epochDate: Date.now()
    }, { merge: true });
    setStep('dashboard');
  };

  const toggleWatering = async (dateStr, memberId) => {
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'main');
    const key = `${dateStr}_${memberId}`;
    const newCompleted = { ...completed, [key]: !completed[key] };
    await setDoc(scheduleRef, { completed: newCompleted }, { merge: true });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="text-center">
        <Droplets className="w-12 h-12 text-emerald-500 animate-bounce mx-auto mb-4" />
        <p className="font-bold text-emerald-800">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  // --- MÀN HÌNH SETUP (HÌNH image_7e32e5.png) ---
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-lg">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500 p-4 rounded-3xl shadow-lg shadow-emerald-200">
              <Leaf className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 text-center mb-2">Thiết Lập Team</h1>
          <p className="text-slate-400 text-center mb-8">Cùng nhau xây dựng môi trường làm việc xanh</p>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Tên dự án lịch</label>
              <input 
                className="w-full mt-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
                value={calendarTitle} onChange={e => setCalendarTitle(e.target.value)} placeholder="Xanh..."
              />
            </div>

            <div className="flex gap-2">
              <input 
                className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-medium"
                placeholder="Tên..." value={newMemberName} onChange={e => setNewMemberName(e.target.value)}
              />
              <input 
                className="w-32 p-4 bg-slate-50 border-none rounded-2xl font-medium"
                placeholder="Team..." value={newMemberTeam} onChange={e => setNewMemberTeam(e.target.value)}
              />
              <button 
                onClick={() => {
                  if (newMemberName) {
                    setMembers([...members, { id: Date.now(), name: newMemberName, team: newMemberTeam }]);
                    setNewMemberName(''); setNewMemberTeam('');
                  }
                }}
                className="bg-slate-800 text-white p-4 rounded-2xl hover:bg-slate-700"
              >
                <Plus />
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700">{m.name} <span className="text-slate-400 font-normal">({m.team})</span></span>
                  <button onClick={() => setMembers(members.filter(i => i.id !== m.id))}><X className="w-4 h-4 text-rose-400"/></button>
                </div>
              ))}
            </div>

            <button 
              onClick={handleStartApp}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-emerald-100 transition-all active:scale-95"
            >
              BẮT ĐẦU CHĂM SÓC CÂY
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH DASHBOARD (HÌNH image_471b9f.png) ---
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-1 flex items-center gap-3">
              {calendarTitle} <Leaf className="text-emerald-500 w-8 h-8" />
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Đồng hành cùng {members.length} người yêu môi trường
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-2xl font-bold shadow-sm hover:shadow-md transition-all border border-slate-100">
              <Trophy className="w-5 h-5 text-amber-500" /> Bảng xếp hạng
            </button>
            <button onClick={() => setStep('setup')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-2xl font-bold shadow-sm hover:shadow-md transition-all border border-slate-100">
              <Settings className="w-5 h-5 text-slate-400" /> Thiết lập lại
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-50 p-6 md:p-10">
           {/* Phần lịch và danh sách thành viên sẽ render tại đây dựa trên ngày hiện tại */}
           <div className="flex justify-between items-center mb-8">
              <button onClick={() => {
                const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d);
              }} className="p-3 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                <ChevronLeft />
              </button>
              <h2 className="text-2xl font-black text-slate-800">Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}</h2>
              <button onClick={() => {
                const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d);
              }} className="p-3 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                <ChevronRight />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => {
                const dateStr = formatDate(currentDate);
                const isDone = completed[`${dateStr}_${member.id}`];
                return (
                  <div key={member.id} className={`p-6 rounded-[32px] border-2 transition-all ${isDone ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{member.team}</p>
                        <h3 className="text-xl font-black text-slate-800">{member.name}</h3>
                      </div>
                      {isDone ? <CheckCircle2 className="text-emerald-500 w-8 h-8" /> : <Droplets className="text-slate-200 w-8 h-8" />}
                    </div>
                    <button 
                      onClick={() => toggleWatering(dateStr, member.id)}
                      className={`w-full py-4 rounded-2xl font-bold transition-all ${isDone ? 'bg-white text-emerald-600 shadow-sm' : 'bg-slate-900 text-white hover:bg-emerald-500 shadow-lg shadow-slate-200'}`}
                    >
                      {isDone ? 'Đã hoàn thành ✨' : 'Chưa tưới cây'}
                    </button>
                  </div>
                )
              })}
           </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowLeaderboard(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">Kiện tướng chăm cây <Crown className="text-amber-500"/></h2>
            <div className="space-y-4">
              {members.map(m => {
                const count = Object.keys(completed).filter(k => k.endsWith(`_${m.id}`) && completed[k]).length;
                const badge = getBadgeInfo(count);
                return (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-800">{m.name}</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${badge.bg} ${badge.color}`}>{badge.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600">{count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lần tưới</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
