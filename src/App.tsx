import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import RoleSelection from './pages/RoleSelection';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Quran from './pages/Quran';
import Classes from './pages/Classes';
import Profile from './pages/Profile';
import LogPractice from './pages/LogPractice';
import Timetable from './pages/Timetable';
import Qibla from './pages/Qibla';
import Notifications from './pages/Notifications';
import InstallPrompt from './components/common/InstallPrompt/InstallPrompt';
import {
    TeacherDashboard,
    TeacherClasses,
    TeacherRecords,
    TeacherProfile,
} from './pages/teacher';
import {
    SchoolSetup,
    ManagementDashboard,
    ManagementReports,
    ManagementClasses,
    ManagementStudents,
    ManagementTeachers,
    RegisterTeacher,
    ManagementProfile,
} from './pages/management';

const App: React.FC = () => {
    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Onboarding />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/auth" element={<Auth />} />

                {/* Student Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/quran" element={<Quran />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/log-practice" element={<LogPractice />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/qibla" element={<Qibla />} />
                <Route path="/notifications" element={<Notifications />} />

                {/* Teacher Routes */}
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/classes" element={<TeacherClasses />} />
                <Route path="/teacher/records" element={<TeacherRecords />} />
                <Route path="/teacher/records/:classId" element={<TeacherRecords />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />

                {/* Management Routes */}
                <Route path="/management/setup" element={<SchoolSetup />} />
                <Route path="/management/dashboard" element={<ManagementDashboard />} />
                <Route path="/management/reports" element={<ManagementReports />} />
                <Route path="/management/classes" element={<ManagementClasses />} />
                <Route path="/management/students" element={<ManagementStudents />} />
                <Route path="/management/teachers" element={<ManagementTeachers />} />
                <Route path="/management/teachers/register" element={<RegisterTeacher />} />
                <Route path="/management/profile" element={<ManagementProfile />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <InstallPrompt />
        </>
    );
};

export default App;
