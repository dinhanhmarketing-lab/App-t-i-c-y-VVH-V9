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
              <label className="text-xs font-bold text-slate-400 uppercase ml-2
