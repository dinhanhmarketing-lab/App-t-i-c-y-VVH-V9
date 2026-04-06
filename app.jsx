import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot
} from 'firebase/firestore';
import { 
  Calendar, Users, Settings, ChevronLeft, ChevronRight, 
  Trash2, Plus, Leaf, Droplets, 
  Upload, CheckCircle2, X, Globe, History, TrendingUp,
  ChevronDown, Trophy, Medal, Award, Crown, Star
} from 'lucide-react';

// --- 1. CẤU HÌNH FIREBASE (BẮT BUỘC THAY BẰNG THÔNG TIN CỦA BẠN) ---
// Bạn lấy thông tin này trong Project Settings của Firebase Console nhé
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'watering-team-app'; // ID cố định cho ứng dụng của bạn

// --- UTILS ---
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

const isToday = (date) => {
  const t = new Date();
  return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
};

const getBadgeInfo = (count) => {
  if (count <= 3) return { label: "Người tưới cho có", color: "text-slate-400", bg: "bg-slate-100" };
  if (count <= 5) return { label: "Người tập tưới", color: "text-blue-500", bg: "bg-blue-50" };
  if (count <= 10) return { label: "Người tưới có tâm", color: "text-emerald-500", bg: "bg-emerald-50" };
  if (count <= 20) return { label: "Người tưới ra hoa", color: "text-pink-500", bg: "bg-pink-50" };
  return { label: "Người tưới cả thế giới", color: "text-amber-500", bg: "bg-amber-50" };
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App State
  const [step, setStep] = useState('loading');
  const [calendarTitle, setCalendarTitle] = useState('');
  const [members, setMembers] = useState([]);
  const [epochDate, setEpochDate] = useState(null);
  const [wateringDaysOverride, setWateringDaysOverride] = useState({});
  const [swaps, setSwaps] = useState({});
  const [completed, setCompleted] = useState({});

  // UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberTeam, setNewMemberTeam] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // --- AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- DATA SYNC ---
  useEffect(() => {
    if (!user) return;

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCalendarTitle(data.title || '');
        setMembers(data.members || []);
        if (data.epochDate) setEpochDate(new Date(data.epochDate));
        if (data.members?.length > 0 && data.epochDate) setStep('dashboard');
        else setStep('setup');
      } else {
        setStep('setup');
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'main');
    const unsubSchedule = onSnapshot(scheduleRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSwaps(data.swaps || {});
        setCompleted(data.completed || {});
        setWateringDaysOverride(data.overrides || {});
