// client/src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm]   = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.response?.data?.error || 'خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0D2137',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Cairo,sans-serif',direction:'rtl'}}>
      <div style={{background:'white',borderRadius:16,padding:'36px 32px',width:'100%',maxWidth:400,boxShadow:'0 24px 64px rgba(0,0,0,.4)'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:56,height:56,background:'#D4A017',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 12px'}}>📚</div>
          <div style={{fontSize:20,fontWeight:800,color:'#0D2137'}}>سلاح التلميذ</div>
          <div style={{fontSize:12,color:'#8FA8C0',marginTop:4}}>نظام إدارة إنتاج الكتب</div>
        </div>

        {error && (
          <div style={{background:'#FFEBEE',border:'1px solid #FFCDD2',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#8C1A1A',marginBottom:16,textAlign:'center'}}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:700,color:'#0D2137',display:'block',marginBottom:6}}>اسم المستخدم</label>
            <input
              type="text" value={form.username} autoComplete="username"
              onChange={e => setForm(f => ({...f, username: e.target.value}))}
              placeholder="admin"
              style={{width:'100%',border:'1.5px solid #E2EBF3',borderRadius:8,padding:'10px 12px',fontFamily:'Cairo,sans-serif',fontSize:14,outline:'none'}}
              required
            />
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:700,color:'#0D2137',display:'block',marginBottom:6}}>كلمة المرور</label>
            <input
              type="password" value={form.password} autoComplete="current-password"
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              placeholder="••••••••"
              style={{width:'100%',border:'1.5px solid #E2EBF3',borderRadius:8,padding:'10px 12px',fontFamily:'Cairo,sans-serif',fontSize:14,outline:'none'}}
              required
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{width:'100%',background:loading?'#8FA8C0':'#0A7E8C',color:'white',border:'none',borderRadius:8,padding:'12px',fontFamily:'Cairo,sans-serif',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',transition:'background .15s'}}
          >
            {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{marginTop:20,padding:'12px',background:'#F0F4F8',borderRadius:8,fontSize:11,color:'#8FA8C0',textAlign:'center'}}>
          <div style={{fontWeight:700,marginBottom:4}}>بيانات تجريبية:</div>
          <div>admin / admin123 &nbsp;|&nbsp; sara / sara123</div>
        </div>
      </div>
    </div>
  );
}
