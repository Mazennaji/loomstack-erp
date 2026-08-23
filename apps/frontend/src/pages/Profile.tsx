import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useUploadAvatar,
} from '../hooks/useProfile';

const API_BASE = (
  import.meta as ImportMeta & { env: { VITE_API_BASE?: string } }
).env.VITE_API_BASE ?? '';

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft';
const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted';

function resolveAvatar(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email);
      setAvatarUrl(profile.avatarUrl ?? '');
    }
  }, [profile]);

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    updateProfile.mutate(
      { name, email, avatarUrl: avatarUrl || undefined },
      {
        onSuccess: () => {
          setSavedMsg(true);
          setTimeout(() => setSavedMsg(false), 2500);
        },
      },
    );
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
  }

  function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    setPwError(null);
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPwMsg('Password updated.');
          setCurrentPassword('');
          setNewPassword('');
        },
        onError: (err: any) => {
          setPwError(err?.response?.data?.message || 'Could not update password.');
        },
      },
    );
  }

  const displayAvatar = resolveAvatar(profile?.avatarUrl ?? null);
  const initials = (profile?.name || profile?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted">Loading profile…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-signal">00</span>
          <h1 className="font-display text-2xl font-600 tracking-tight">Profile</h1>
        </div>
        <p className="mt-1 pl-8 text-sm text-muted">
          Manage your name, email, avatar, and password.
        </p>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-xl border border-line bg-navy">
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-signal) 1px, transparent 1px), linear-gradient(90deg, var(--color-signal) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="relative flex items-center gap-5 p-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-surface/20 bg-navy-soft">
              {displayAvatar ? (
                <img src={displayAvatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-2xl font-600 text-navy">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadAvatar.isPending}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-signal text-navy shadow-md transition-transform hover:scale-110 disabled:opacity-50"
            >
              {uploadAvatar.isPending ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-navy border-t-transparent" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M11 2l3 3-7 7-4 1 1-4 7-7z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          <div className="min-w-0">
            <div className="font-display text-xl font-600 tracking-tight text-surface">
              {profile?.name || 'Unnamed user'}
            </div>
            <div className="mt-0.5 font-mono text-[13px] text-surface/60">{profile?.email}</div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-surface/50">
              {profile?.role && (
                <span>
                  <span className="text-signal">role</span> {profile.role}
                </span>
              )}
              {profile?.tenantId && (
                <span>
                  <span className="text-signal">tenant</span> {profile.tenantId.slice(0, 8)}
                </span>
              )}
              {profile?.createdAt && (
                <span>
                  <span className="text-signal">since</span> {formatDate(profile.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-xl border border-line bg-surface lg:col-span-2">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-signal" />
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Account details
            </h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-5 p-6">
            <div>
              <label className={labelClass}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Avatar URL (optional)</label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className={fieldClass}
              />
              <p className="mt-1.5 text-xs text-muted">
                Paste a link, or use the camera button on your photo to upload.
              </p>
            </div>

            {updateProfile.isError && (
              <div className="rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
                {(updateProfile.error as any)?.response?.data?.message ||
                  'Could not save changes.'}
              </div>
            )}
            {savedMsg && (
              <div className="rounded-md bg-done-soft px-3 py-2 text-sm text-done">
                Profile saved.
              </div>
            )}

            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
            >
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        <section className="relative h-fit overflow-hidden rounded-xl border border-line bg-surface">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-signal" />
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Change password
            </h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4 p-6">
            <div>
              <label className={labelClass}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className={fieldClass}
              />
              <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>
            </div>

            {pwError && (
              <div className="rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">{pwError}</div>
            )}
            {pwMsg && (
              <div className="rounded-md bg-done-soft px-3 py-2 text-sm text-done">{pwMsg}</div>
            )}

            <button
              type="submit"
              disabled={changePassword.isPending}
              className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
            >
              {changePassword.isPending ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}