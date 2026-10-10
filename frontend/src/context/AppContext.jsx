import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [intendedPage, setIntendedPage] = useState('dashboard');

  const [activePage, setActivePageState] = useState('landing');
  const [targetRoleId, setTargetRoleId] = useState('frontend-engineer');
  const [roles, setRoles] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [roadmapTasks, setRoadmapTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeInterviewQuestion, setActiveInterviewQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);

  // Toast notification helper
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Protected pages list
  const protectedPages = ['dashboard', 'resume', 'atlas', 'match', 'interview', 'roadmap', 'analytics', 'settings'];

  // Route navigation with authentication guard
  const setActivePage = useCallback((page) => {
    if (protectedPages.includes(page) && !currentUser && !authChecking) {
      setIntendedPage(page);
      setActivePageState('login');
      addToast('Please sign in to access your personal career intelligence dossier.', 'info');
      return;
    }
    setActivePageState(page);
  }, [currentUser, authChecking, addToast]);

  // Initial Boot: Check auth session from HttpOnly cookie & load roles catalog
  useEffect(() => {
    async function boot() {
      try {
        setAuthChecking(true);
        // Load public roles catalog and health status
        const [rolesRes, healthRes] = await Promise.allSettled([
          api.getRoles(),
          api.getHealth()
        ]);
        if (rolesRes.status === 'fulfilled') setRoles(rolesRes.value);
        if (healthRes.status === 'fulfilled') setHealthStatus(healthRes.value);

        // Check active session
        try {
          const authRes = await api.getMe();
          if (authRes.authenticated && authRes.user) {
            api.setAuthToken(authRes.user.id);
            setCurrentUser(authRes.user);
            if (authRes.candidate) {
              setCandidate(authRes.candidate);
              if (authRes.candidate.target_role) {
                setTargetRoleId(authRes.candidate.target_role);
              }
            }
          } else {
            api.setAuthToken(null);
            setCurrentUser(null);
          }
        } catch (e) {
          // Unauthenticated guest user - expected for public visitors
          api.setAuthToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Boot error:", err);
      } finally {
        setAuthChecking(false);
      }
    }
    boot();
  }, []);

  // Refresh user-specific data (only when user is authenticated)
  const refreshData = useCallback(async (roleId = targetRoleId) => {
    if (!currentUser) {
      setMatchData(null);
      setSkills([]);
      setRoadmapTasks([]);
      setAnalytics(null);
      return;
    }

    try {
      setLoading(true);
      const [candRes, matchRes, skillsRes, roadRes, anaRes] = await Promise.allSettled([
        api.getCandidate(),
        api.getJobMatch(roleId),
        api.getSkills(),
        api.getRoadmap(roleId),
        api.getAnalytics()
      ]);

      if (candRes.status === 'fulfilled') setCandidate(candRes.value);
      if (matchRes.status === 'fulfilled') setMatchData(matchRes.value);
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value);
      if (roadRes.status === 'fulfilled') setRoadmapTasks(roadRes.value);
      if (anaRes.status === 'fulfilled') setAnalytics(anaRes.value);
    } catch (err) {
      console.warn("Data refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, targetRoleId]);

  useEffect(() => {
    if (currentUser) {
      refreshData(targetRoleId);
    }
  }, [currentUser, targetRoleId, refreshData]);

  // Auth Actions
  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.user) {
      api.setAuthToken(res.user.id);
      setCurrentUser(res.user);
      addToast(res.message || `Welcome back, ${res.user.full_name}!`, 'success');
      await refreshData();
      const target = intendedPage || 'dashboard';
      setIntendedPage('dashboard');
      setActivePageState(target);
    }
    return res;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    if (res.user) {
      api.setAuthToken(res.user.id);
      setCurrentUser(res.user);
      addToast(`Account created! Welcome to SkillOrbit, ${res.user.full_name}.`, 'success');
      await refreshData();
      setActivePageState('dashboard');
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn("Logout request failed:", e);
    }
    api.setAuthToken(null);
    setCurrentUser(null);
    setCandidate(null);
    setMatchData(null);
    setSkills([]);
    setRoadmapTasks([]);
    setAnalytics(null);
    setActivePageState('landing');
    addToast('You have been signed out.', 'info');
  };

  // Role Switcher for Authenticated User
  const handleRoleChange = async (newRoleId) => {
    setTargetRoleId(newRoleId);
    if (currentUser) {
      try {
        await api.updateCandidate({ target_role: newRoleId });
        setCandidate(prev => ({ ...prev, target_role: newRoleId }));
      } catch (e) {
        console.warn("Role update error:", e);
      }
    }
    addToast(`Target role calibrated to ${newRoleId.replace(/-/g, ' ').toUpperCase()}`, 'info');
  };

  // 1-Click Launch interview practice
  const launchInterviewForSkill = (skillName) => {
    setActiveInterviewQuestion({ target_skill: skillName });
    setActivePage('interview');
  };

  const launchInterviewWithQuestion = (question) => {
    setActiveInterviewQuestion(question);
    setActivePage('interview');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authChecking,
        login,
        register,
        logout,
        activePage,
        setActivePage,
        intendedPage,
        setIntendedPage,
        targetRoleId,
        setTargetRoleId: handleRoleChange,
        roles,
        candidate,
        setCandidate,
        matchData,
        skills,
        roadmapTasks,
        analytics,
        activeInterviewQuestion,
        setActiveInterviewQuestion,
        launchInterviewForSkill,
        launchInterviewWithQuestion,
        refreshData,
        toasts,
        addToast,
        removeToast,
        healthStatus,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
