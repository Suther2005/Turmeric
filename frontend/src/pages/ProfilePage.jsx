import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, ScanLine, FileText, Activity, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    location: user?.location || '',
  });
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const updated = await authService.updateProfile(profile);
      setUser?.(prev => ({ ...prev, ...updated }));
      toast.success('Profile updated successfully ✅');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwdForm.old_password || !pwdForm.new_password) { toast.error('Fill all password fields'); return; }
    if (pwdForm.new_password.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (pwdForm.new_password !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPwd(true);
    try {
      await authService.changePassword(pwdForm.old_password, pwdForm.new_password);
      toast.success('Password changed successfully 🔒');
      setPwdForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  const initials = (user?.name || 'TC').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const stats = [
    { label: 'Total Scans',    value: '28',   icon: ScanLine },
    { label: 'Reports',        value: '12',   icon: FileText },
    { label: 'Avg Health',     value: '72%',  icon: Activity },
  ];

  return (
    <AppLayout pageTitle="Profile">
      <div className="page-container space-y-6">
        <div className="mb-6">
          <h1 className="section-title">My Profile</h1>
          <p className="section-subtitle">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Avatar + Stats ── */}
          <div className="space-y-4">
            <div className="card text-center">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-3xl font-display font-bold text-white mx-auto mb-4 shadow-glow">
                {initials}
              </div>
              <h2 className="font-display font-bold text-xl text-surface-50">{user?.name || 'Farmer'}</h2>
              <p className="text-sm text-surface-400 mt-0.5">{user?.email}</p>
              <span className={`badge mt-3 ${user?.role === 'admin' ? 'badge-warning' : 'badge-success'} text-xs capitalize`}>
                {user?.role || 'user'}
              </span>
              {user?.location && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-surface-500 mt-3">
                  <MapPin className="w-3.5 h-3.5" /> {user.location}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="card space-y-3">
              <h3 className="text-sm font-semibold text-surface-200">Account Statistics</h3>
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
                  <div className="flex items-center gap-2.5 text-sm text-surface-400">
                    <Icon className="w-4 h-4 text-primary-400" />
                    {label}
                  </div>
                  <span className="font-semibold text-surface-100">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Forms ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Edit Profile */}
            <div className="card">
              <h2 className="text-sm font-semibold text-surface-200 mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-400" /> Personal Information
              </h2>
              <form onSubmit={handleProfileSave} className="space-y-4" id="profile-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label" htmlFor="profile-name">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <input id="profile-name" type="text" value={profile.name}
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                        className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="profile-email">Email (read-only)</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <input id="profile-email" type="email" value={user?.email || ''}
                        readOnly className="input pl-10 opacity-60 cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="profile-phone">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <input id="profile-phone" type="tel" value={profile.phone}
                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="profile-location">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <input id="profile-location" type="text" value={profile.location}
                        onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                        placeholder="Erode, Tamil Nadu" className="input pl-10" />
                    </div>
                  </div>
                </div>
                <button type="submit" id="save-profile" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card">
              <h2 className="text-sm font-semibold text-surface-200 mb-5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary-400" /> Change Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4" id="password-form">
                {[
                  { id: 'old-password', label: 'Current Password', key: 'old_password' },
                  { id: 'new-password', label: 'New Password',     key: 'new_password' },
                  { id: 'confirm-pwd',  label: 'Confirm New Password', key: 'confirm' },
                ].map(field => (
                  <div key={field.id}>
                    <label className="input-label" htmlFor={field.id}>{field.label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                      <input id={field.id}
                        type={showPwd ? 'text' : 'password'}
                        value={pwdForm[field.key]}
                        onChange={e => setPwdForm(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder="••••••••"
                        className="input pl-10 pr-10" />
                      {field.key === 'confirm' && (
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="submit" id="change-password" disabled={savingPwd} className="btn-outline">
                  {savingPwd ? 'Updating...' : <><Lock className="w-4 h-4" /> Update Password</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
