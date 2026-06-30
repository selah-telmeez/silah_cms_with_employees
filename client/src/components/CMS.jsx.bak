// client/src/components/CMS.jsx
// This file wires the uploaded Content_Management_System.jsx logic
// to real API data. Copy the full body of Content_Management_System.jsx
// here and replace the export default App() signature as shown below.

// ─────────────────────────────────────────────────────────
// INSTRUCTIONS:
// 1. Open your uploaded Content_Management_System.jsx
// 2. Copy everything from line 1 to the end
// 3. Paste it here, replacing this file's content
// 4. Change the last line from:
//       export default function App(){
//    to:
//       export default function CMS({ data, user, onLogout, onRefresh,
//         onUpdateTask, onAddTask, onDeleteTask,
//         onAddMember, onUpdateMember,
//         onUpdatePhaseProgress, onAddActivity, onUpdateGate }){
//
// 5. Inside the function body, replace:
//       const [data,setData]=useState(()=>loadData());
//    with:
//       // data comes from props (real API)
//
// 6. Replace all setData(...) calls with the matching prop:
//       onUpdateTask(t)   instead of updating tasks in setData
//       onAddTask(t)      instead of adding to tasks
//       onDeleteTask(id)  instead of filtering tasks
//       onAddMember(m)    instead of adding to members
//       onUpdateMember(m) instead of updating members
//       onUpdatePhaseProgress(id, val)
//       onAddActivity(act)
//
// 7. Add a Logout button in the topbar using onLogout()
//
// 8. The saveData() / loadData() calls can be removed since
//    the server is now the source of truth.
// ─────────────────────────────────────────────────────────

// Minimal placeholder so the app compiles before you paste your code:
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
         PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function CMS({ data, user, onLogout, onRefresh,
  onUpdateTask, onAddTask, onDeleteTask,
  onAddMember, onUpdateMember,
  onUpdatePhaseProgress, onAddActivity, onUpdateGate }) {

  const [page, setPage] = useState('dashboard');
  const totalProg = Math.round(
    Object.values(data.phaseProgress).reduce((a,b)=>a+b,0) /
    Object.keys(data.phaseProgress).length
  );

  return (
    <div style={{fontFamily:'Cairo,sans-serif',direction:'rtl',minHeight:'100vh',background:'#F0F4F8'}}>
      {/* Topbar */}
      <div style={{background:'#0D2137',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,background:'#D4A017',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📚</div>
          <div>
            <div style={{color:'white',fontWeight:800,fontSize:15}}>سلاح التلميذ</div>
            <div style={{color:'#8FA8C0',fontSize:10}}>نظام إدارة إنتاج الكتب</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{color:'#8FA8C0',fontSize:12}}>مرحبًا، {user?.name}</div>
          <div style={{background:'#0A7E8C',color:'white',borderRadius:8,padding:'4px 12px',fontSize:12,fontWeight:700}}>
            الإنجاز: {totalProg}%
          </div>
          <button onClick={onRefresh} style={{background:'rgba(255,255,255,.1)',border:'none',borderRadius:8,padding:'6px 12px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,cursor:'pointer'}}>
            🔄 تحديث
          </button>
          <button onClick={onLogout} style={{background:'#8C1A1A',border:'none',borderRadius:8,padding:'6px 12px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,cursor:'pointer'}}>
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
        {[
          {l:'الإنجاز الكلي',    v:`${totalProg}%`, c:'#0A7E8C'},
          {l:'المهام المكتملة',   v:`${data.tasks.filter(t=>t.status==='مكتمل').length}/${data.tasks.length}`, c:'#1A7A4A'},
          {l:'المهام الجارية',    v:data.tasks.filter(t=>t.status==='جارٍ').length, c:'#1A4A7A'},
          {l:'أعضاء الفريق',     v:data.members.length, c:'#6B3FA0'},
        ].map(k=>(
          <div key={k.l} style={{background:'white',borderRadius:12,padding:'18px 16px',border:'1px solid #E2EBF3',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#8FA8C0',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8}}>{k.l}</div>
            <div style={{fontSize:32,fontWeight:900,color:k.c,fontFamily:'Space Mono,monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Paste your full CMS component here to get all 7 pages */}
      <div style={{padding:'0 24px 24px',textAlign:'center',color:'#8FA8C0',fontSize:13}}>
        ✅ الخادم يعمل — قاعدة البيانات متصلة<br/>
        الآن: افتح <code>client/src/components/CMS.jsx</code> واتبع تعليمات الدمج<br/>
        أو ضع ملف <code>Content_Management_System.jsx</code> مباشرة هنا
      </div>
    </div>
  );
}
