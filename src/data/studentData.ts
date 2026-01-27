// Mock data for the Student Section
// This file centralizes all mock data used throughout the student interface

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: 'student';
    enrollmentDate: string;
    halaqa: string;
    teacher: string;
    settings: {
        notifications: boolean;
        darkMode: boolean;
        language: 'en' | 'ar' | 'ha';
        prayerReminders: boolean;
    };
}

export interface TahfeezProgress {
    currentJuz: number;
    totalJuz: number;
    memorizedSurahs: number;
    totalSurahs: number;
    dailyGoalMinutes: number;
    todayPracticeMinutes: number;
    streak: number;
    lastPracticeDate: string;
    weeklyProgress: { day: string; minutes: number }[];
}

export interface ScheduleItem {
    id: string;
    day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
    startTime: string;
    endTime: string;
    subject: string;
    type: 'tahfeez' | 'islamiyya' | 'tajweed' | 'arabic';
    location: string;
    teacher: string;
}

export interface PracticeLog {
    id: string;
    date: string;
    duration: number; // in minutes
    surahName: string;
    surahNumber: number;
    ayahStart: number;
    ayahEnd: number;
    type: 'memorization' | 'revision' | 'recitation';
    notes?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'reminder' | 'announcement' | 'achievement' | 'alert';
    timestamp: string;
    read: boolean;
    icon?: string;
}

export interface Surah {
    number: number;
    name: string;
    arabicName: string;
    englishName: string;
    ayahCount: number;
    revelationType: 'meccan' | 'medinan';
    memorized: boolean;
    progress: number; // 0-100
    lastRead?: string;
    bookmarked: boolean;
}

// ============ MOCK DATA ============

export const userProfile: UserProfile = {
    id: 'STU-2024-001',
    name: 'Ahmad Abdullahi',
    email: 'ahmad.abdullahi@email.com',
    phone: '+234 801 234 5678',
    avatar: '👦🏽',
    role: 'student',
    enrollmentDate: '2024-09-01',
    halaqa: 'Halaqa A',
    teacher: 'Ustaz Abubakar Musa',
    settings: {
        notifications: true,
        darkMode: false,
        language: 'en',
        prayerReminders: true,
    },
};

export const tahfeezProgress: TahfeezProgress = {
    currentJuz: 12,
    totalJuz: 30,
    memorizedSurahs: 42,
    totalSurahs: 114,
    dailyGoalMinutes: 30,
    todayPracticeMinutes: 18,
    streak: 7,
    lastPracticeDate: '2026-01-26',
    weeklyProgress: [
        { day: 'Sun', minutes: 25 },
        { day: 'Mon', minutes: 32 },
        { day: 'Tue', minutes: 28 },
        { day: 'Wed', minutes: 35 },
        { day: 'Thu', minutes: 22 },
        { day: 'Fri', minutes: 40 },
        { day: 'Sat', minutes: 18 },
    ],
};

export const weeklySchedule: ScheduleItem[] = [
    {
        id: 'sch-1',
        day: 'sunday',
        startTime: '04:00 PM',
        endTime: '05:30 PM',
        subject: 'Tahfeez - Juz 12',
        type: 'tahfeez',
        location: 'Main Hall',
        teacher: 'Ustaz Abubakar Musa',
    },
    {
        id: 'sch-2',
        day: 'sunday',
        startTime: '05:45 PM',
        endTime: '06:30 PM',
        subject: 'Tajweed Fundamentals',
        type: 'tajweed',
        location: 'Room 102',
        teacher: 'Ustaz Yusuf Idris',
    },
    {
        id: 'sch-3',
        day: 'monday',
        startTime: '04:00 PM',
        endTime: '05:30 PM',
        subject: 'Tahfeez - Juz 12',
        type: 'tahfeez',
        location: 'Main Hall',
        teacher: 'Ustaz Abubakar Musa',
    },
    {
        id: 'sch-4',
        day: 'tuesday',
        startTime: '04:00 PM',
        endTime: '05:00 PM',
        subject: 'Fiqh & Hadith',
        type: 'islamiyya',
        location: 'Room 104',
        teacher: "Malama A'isha Bello",
    },
    {
        id: 'sch-5',
        day: 'wednesday',
        startTime: '04:00 PM',
        endTime: '05:30 PM',
        subject: 'Tahfeez - Juz 12',
        type: 'tahfeez',
        location: 'Main Hall',
        teacher: 'Ustaz Abubakar Musa',
    },
    {
        id: 'sch-6',
        day: 'thursday',
        startTime: '04:00 PM',
        endTime: '05:00 PM',
        subject: 'Arabic Language',
        type: 'arabic',
        location: 'Room 103',
        teacher: 'Ustaz Ibrahim Musa',
    },
    {
        id: 'sch-7',
        day: 'friday',
        startTime: '02:00 PM',
        endTime: '03:30 PM',
        subject: 'Quran Revision & Murajaah',
        type: 'tahfeez',
        location: 'Main Hall',
        teacher: 'Ustaz Abubakar Musa',
    },
];

export const practiceLogs: PracticeLog[] = [
    {
        id: 'log-1',
        date: '2026-01-26',
        duration: 18,
        surahName: 'Yusuf',
        surahNumber: 12,
        ayahStart: 1,
        ayahEnd: 20,
        type: 'memorization',
        notes: 'Working on first 20 ayahs',
    },
    {
        id: 'log-2',
        date: '2026-01-25',
        duration: 25,
        surahName: 'Hud',
        surahNumber: 11,
        ayahStart: 100,
        ayahEnd: 123,
        type: 'revision',
    },
    {
        id: 'log-3',
        date: '2026-01-24',
        duration: 30,
        surahName: 'Yunus',
        surahNumber: 10,
        ayahStart: 1,
        ayahEnd: 109,
        type: 'recitation',
        notes: 'Full surah recitation',
    },
    {
        id: 'log-4',
        date: '2026-01-23',
        duration: 22,
        surahName: 'Yusuf',
        surahNumber: 12,
        ayahStart: 1,
        ayahEnd: 15,
        type: 'memorization',
    },
    {
        id: 'log-5',
        date: '2026-01-22',
        duration: 35,
        surahName: 'At-Tawbah',
        surahNumber: 9,
        ayahStart: 100,
        ayahEnd: 129,
        type: 'revision',
    },
];

export const notifications: Notification[] = [
    {
        id: 'notif-1',
        title: 'Practice Reminder',
        message: "You haven't logged your Quran practice today. Keep your streak going!",
        type: 'reminder',
        timestamp: '2026-01-26T14:00:00',
        read: false,
    },
    {
        id: 'notif-2',
        title: '🎉 Achievement Unlocked!',
        message: 'Congratulations! You completed 7 days streak of Quran practice!',
        type: 'achievement',
        timestamp: '2026-01-25T18:30:00',
        read: false,
    },
    {
        id: 'notif-3',
        title: 'Class Cancelled',
        message: "Tomorrow's Tajweed class is cancelled due to teacher absence.",
        type: 'alert',
        timestamp: '2026-01-25T10:00:00',
        read: true,
    },
    {
        id: 'notif-4',
        title: 'New Announcement',
        message: 'End of semester exams will begin on February 15th. Please prepare accordingly.',
        type: 'announcement',
        timestamp: '2026-01-24T09:00:00',
        read: true,
    },
    {
        id: 'notif-5',
        title: 'Fajr Prayer',
        message: 'Fajr prayer time in 10 minutes. Time to wake up!',
        type: 'reminder',
        timestamp: '2026-01-26T05:20:00',
        read: true,
    },
];

export const surahList: Surah[] = [
    { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', englishName: 'The Opening', ayahCount: 7, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: true },
    { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', englishName: 'The Cow', ayahCount: 286, revelationType: 'medinan', memorized: false, progress: 45, bookmarked: false },
    { number: 3, name: 'Ali-Imran', arabicName: 'آل عمران', englishName: 'The Family of Imran', ayahCount: 200, revelationType: 'medinan', memorized: false, progress: 30, bookmarked: false },
    { number: 4, name: 'An-Nisa', arabicName: 'النساء', englishName: 'The Women', ayahCount: 176, revelationType: 'medinan', memorized: false, progress: 20, bookmarked: false },
    { number: 5, name: 'Al-Maidah', arabicName: 'المائدة', englishName: 'The Table Spread', ayahCount: 120, revelationType: 'medinan', memorized: false, progress: 15, bookmarked: false },
    { number: 6, name: 'Al-Anam', arabicName: 'الأنعام', englishName: 'The Cattle', ayahCount: 165, revelationType: 'meccan', memorized: false, progress: 10, bookmarked: false },
    { number: 7, name: 'Al-Araf', arabicName: 'الأعراف', englishName: 'The Heights', ayahCount: 206, revelationType: 'meccan', memorized: false, progress: 5, bookmarked: false },
    { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', englishName: 'The Spoils of War', ayahCount: 75, revelationType: 'medinan', memorized: true, progress: 100, bookmarked: false },
    { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', englishName: 'The Repentance', ayahCount: 129, revelationType: 'medinan', memorized: true, progress: 100, bookmarked: false },
    { number: 10, name: 'Yunus', arabicName: 'يونس', englishName: 'Jonah', ayahCount: 109, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: true },
    { number: 11, name: 'Hud', arabicName: 'هود', englishName: 'Hud', ayahCount: 123, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: false },
    { number: 12, name: 'Yusuf', arabicName: 'يوسف', englishName: 'Joseph', ayahCount: 111, revelationType: 'meccan', memorized: false, progress: 35, lastRead: '2026-01-26', bookmarked: true },
    // Juz Amma surahs (78-114) - commonly memorized first
    { number: 78, name: 'An-Naba', arabicName: 'النبأ', englishName: 'The Tidings', ayahCount: 40, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: false },
    { number: 79, name: 'An-Naziat', arabicName: 'النازعات', englishName: 'Those Who Pull Out', ayahCount: 46, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: false },
    { number: 80, name: 'Abasa', arabicName: 'عبس', englishName: 'He Frowned', ayahCount: 42, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: false },
    { number: 110, name: 'An-Nasr', arabicName: 'النصر', englishName: 'The Divine Support', ayahCount: 3, revelationType: 'medinan', memorized: true, progress: 100, bookmarked: false },
    { number: 111, name: 'Al-Masad', arabicName: 'المسد', englishName: 'The Palm Fiber', ayahCount: 5, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: false },
    { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', englishName: 'The Sincerity', ayahCount: 4, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: true },
    { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', englishName: 'The Daybreak', ayahCount: 5, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: false },
    { number: 114, name: 'An-Nas', arabicName: 'الناس', englishName: 'Mankind', ayahCount: 6, revelationType: 'meccan', memorized: true, progress: 100, bookmarked: false },
];

// Helper functions
export const getTodaySchedule = (): ScheduleItem[] => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()] as ScheduleItem['day'];
    return weeklySchedule.filter(item => item.day === today);
};

export const getUnreadNotificationCount = (): number => {
    return notifications.filter(n => !n.read).length;
};

export const getScheduleByDay = (day: ScheduleItem['day']): ScheduleItem[] => {
    return weeklySchedule.filter(item => item.day === day);
};

export const getTypeColor = (type: string): { bg: string; text: string } => {
    switch (type) {
        case 'tahfeez':
            return { bg: '#DBEAFE', text: '#2563EB' };
        case 'islamiyya':
            return { bg: '#D1FAE5', text: '#059669' };
        case 'tajweed':
            return { bg: '#F3E8FF', text: '#9333EA' };
        case 'arabic':
            return { bg: '#FEF3C7', text: '#D97706' };
        default:
            return { bg: '#E5E7EB', text: '#4B5563' };
    }
};
