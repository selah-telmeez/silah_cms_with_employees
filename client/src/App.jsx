// client/src/App.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import {
  getDashboard, getTasks, createTask, updateTask, deleteTask,
  getMembers, createMember, updateMember,
  getPhases, updatePhaseProgress,
  getGates, updateGate,
  getActivity, addActivity,
  getUsers, createUser, updateUser, deleteUser,
} from './api';

// ── Import the CMS component (your uploaded file logic, adapted)
import CMS from './components/CMS';

export default function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Load all data from server
  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const calls = [
        getDashboard(),
        getTasks(),
        getMembers(),
        getPhases(),
        getGates(),
        getActivity(30),
      ];
      // Only admins are authorized to list users — avoid a guaranteed 403 for everyone else
      if (user.role === 'admin') calls.push(getUsers());

      const [dash, tasks, members, phases, gates, activity, users] = await Promise.all(calls);

      // Shape data to match the CMS component's expected format
      const phaseProgress = {};
      phases.data.forEach(p => { phaseProgress[p.id] = p.progress || 0; });

      const gatesMap = {};
      gates.data.forEach(g => { gatesMap[g.id] = g; });

      setData({
        tasks:         tasks.data,
        members:       members.data,
        phases:        phases.data,
        phaseProgress,
        gates:         gatesMap,
        activity:      activity.data,
        summary:       dash.data,
        users:         users ? users.data : [],
      });
    } catch (e) {
      setError('خطأ في تحميل البيانات');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Handlers that hit the API ────────────────────────────
  const handleUpdateTask = async t => {
    try {
      const r = await updateTask(t.id, t);
      setData(d => ({ ...d, tasks: d.tasks.map(x => x.id === t.id ? r.data : x) }));
    } catch (e) { console.error(e); }
  };

  const handleAddTask = async t => {
    try {
      const r = await createTask(t);
      setData(d => ({ ...d, tasks: [r.data, ...d.tasks] }));
    } catch (e) { console.error(e); }
  };

  const handleDeleteTask = async id => {
    try {
      await deleteTask(id);
      setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
    } catch (e) { console.error(e); }
  };

  const handleAddMember = async m => {
    try {
      const r = await createMember(m);
      setData(d => ({ ...d, members: [...d.members, r.data] }));
    } catch (e) { console.error(e); }
  };

  const handleUpdateMember = async m => {
    try {
      const r = await updateMember(m.id, m);
      setData(d => ({ ...d, members: d.members.map(x => x.id === m.id ? r.data : x) }));
    } catch (e) { console.error(e); }
  };

  const handleUpdatePhaseProgress = async (phaseId, val) => {
    try {
      await updatePhaseProgress(phaseId, val);
      setData(d => ({ ...d, phaseProgress: { ...d.phaseProgress, [phaseId]: val } }));
    } catch (e) { console.error(e); }
  };

  const handleAddActivity = async act => {
    try {
      const r = await addActivity(act);
      setData(d => ({ ...d, activity: [r.data, ...d.activity] }));
    } catch (e) { console.error(e); }
  };

  const handleUpdateGate = async (id, updates) => {
    try {
      const r = await updateGate(id, updates);
      setData(d => ({ ...d, gates: { ...d.gates, [id]: r.data } }));
    } catch (e) { console.error(e); }
  };

  // ── Users (admin only) ────────────────────────────────────
  const handleAddUser = async u => {
    try {
      const r = await createUser(u);
      setData(d => ({ ...d, users: [r.data, ...d.users] }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || 'حدث خطأ' };
    }
  };

  const handleUpdateUser = async u => {
    try {
      const r = await updateUser(u.id, u);
      setData(d => ({ ...d, users: d.users.map(x => x.id === u.id ? r.data : x) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || 'حدث خطأ' };
    }
  };

  const handleDeleteUser = async id => {
    try {
      await deleteUser(id);
      setData(d => ({ ...d, users: d.users.map(x => x.id === id ? { ...x, is_active: 0 } : x) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || 'حدث خطأ' };
    }
  };

  // ── Render ───────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{minHeight:'100vh',background:'#0D2137',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontFamily:'Cairo,sans-serif',fontSize:16}}>
        جارٍ التحميل...
      </div>
    );
  }

  if (!user) return <Login />;

  if (loading || !data) {
    return (
      <div style={{minHeight:'100vh',background:'#F0F4F8',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Cairo,sans-serif',direction:'rtl',flexDirection:'column',gap:12}}>
        <div style={{fontSize:32}}>📚</div>
        <div style={{fontSize:16,color:'#8FA8C0'}}>جارٍ تحميل البيانات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Cairo,sans-serif',direction:'rtl'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
          <div style={{color:'#8C1A1A',fontSize:16,marginBottom:16}}>{error}</div>
          <button onClick={loadAll} style={{background:'#0A7E8C',color:'white',border:'none',borderRadius:8,padding:'10px 20px',fontFamily:'Cairo,sans-serif',cursor:'pointer'}}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <CMS
      data={data}
      user={user}
      onLogout={logout}
      onRefresh={loadAll}
      onUpdateTask={handleUpdateTask}
      onAddTask={handleAddTask}
      onDeleteTask={handleDeleteTask}
      onAddMember={handleAddMember}
      onUpdateMember={handleUpdateMember}
      onUpdatePhaseProgress={handleUpdatePhaseProgress}
      onAddActivity={handleAddActivity}
      onUpdateGate={handleUpdateGate}
      onAddUser={handleAddUser}
      onUpdateUser={handleUpdateUser}
      onDeleteUser={handleDeleteUser}
    />
  );
}
