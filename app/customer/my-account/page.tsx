'use client';

import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from '@mui/material';
import { DeleteForever, Logout, Save, VerifiedUser } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import React from 'react';
import Notification, { NotificationType } from '@/app/components/notification';
import AuthTextField from '@/app/components/auth/auth-text-field';

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  isEmailVerified: boolean;
};

type Notice = {
  message: string;
  type: NotificationType;
};

export default function MyAccount() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);

      try {
        const res = await fetch('/api/auth/profile', {
          method: 'GET',
          cache: 'no-store',
        });

        if (res.status === 401) {
          router.replace('/login');
          return;
        }

        if (!res.ok) {
          throw new Error(`Profile request failed with status ${res.status}`);
        }

        const data = (await res.json()) as UserProfile;
        if (!active) return;

        setProfile(data);
        setName(data.name ?? '');
      } catch (error) {
        console.error('Profile load failed:', error);
        if (active) {
          setNotice({
            type: 'error',
            message: 'Could not load your account details.',
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.status === 401) {
        router.replace('/login');
        return;
      }

      if (!res.ok) {
        throw new Error(`Profile update failed with status ${res.status}`);
      }

      const updatedProfile = (await res.json()) as UserProfile;
      setProfile(updatedProfile);
      setName(updatedProfile.name ?? '');
      setNotice({ type: 'success', message: 'Profile updated.' });
    } catch (error) {
      console.error('Profile update failed:', error);
      setNotice({ type: 'error', message: 'Could not update your profile.' });
    } finally {
      setSaving(false);
    }
  };

  const logoutUser = async () => {
    setLoggingOut(true);

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        console.error(`Logout failed with status ${res.status}`);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
      router.replace('/');
    }
  };

  const deleteAccount = async () => {
    setDeletingAccount(true);

    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`Account deletion failed with status ${res.status}`);
      }

      router.replace('/');
    } catch (error) {
      console.error('Account deletion failed:', error);
      setNotice({
        type: 'error',
        message: 'Could not delete your account.',
      });
    } finally {
      setDeletingAccount(false);
      setDeleteDialogOpen(false);
    }
  };

  const hasChanges = profile ? name.trim() !== (profile.name ?? '') : false;

  return (
    <main className="flex flex-1 bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-10 md:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">My Account</h1>
            {profile && (
              <p className="mt-2 text-sm text-neutral-300">{profile.email}</p>
            )}
          </div>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Logout />}
            loading={loggingOut}
            onClick={logoutUser}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Logout
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <CircularProgress color="inherit" />
          </div>
        ) : profile ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-white/15 bg-zinc-950 p-5 md:p-6">
              <div className="mb-5 flex flex-col gap-2">
                <h2 className="text-xl font-medium">Personal Details</h2>
                <Divider sx={{ borderColor: 'rgb(38 38 38)' }} />
              </div>

              <form className="flex flex-col gap-5" onSubmit={saveProfile}>
                <AuthTextField
                  label="Display name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  fullWidth
                  inputProps={{ maxLength: 80 }}
                />

                <AuthTextField
                  label="Email"
                  value={profile.email}
                  disabled
                  fullWidth
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Chip
                    icon={<VerifiedUser />}
                    label={
                      profile.isEmailVerified
                        ? 'Email verified'
                        : 'Email unverified'
                    }
                    color={profile.isEmailVerified ? 'success' : 'warning'}
                    variant="filled"
                    sx={{ width: 'fit-content' }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    loading={saving}
                    disabled={!hasChanges || name.trim().length === 0}
                    sx={{
                      backgroundColor: '#ededed',
                      borderRadius: '9999px',
                      boxShadow: 'none',
                      color: '#000',
                      fontWeight: 500,
                      minHeight: 44,
                      paddingInline: 3,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#d4d4d8',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            </div>

            <aside className="rounded-2xl border border-white/15 bg-zinc-950 p-5 md:p-6">
              <h2 className="text-xl font-medium">Account Status</h2>
              <dl className="mt-5 flex flex-col gap-4 text-sm">
                <div>
                  <dt className="text-neutral-400">User ID</dt>
                  <dd className="mt-1 break-all text-neutral-100">
                    {profile.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-400">Email</dt>
                  <dd className="mt-1 break-all text-neutral-100">
                    {profile.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-400">Verification</dt>
                  <dd className="mt-1 text-neutral-100">
                    {profile.isEmailVerified ? 'Verified' : 'Unverified'}
                  </dd>
                </div>
              </dl>
            </aside>

            <section className="rounded-2xl border border-red-500/40 bg-zinc-950 p-5 md:p-6 lg:col-span-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-medium text-red-200">
                    Delete account
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                    This disables your login, anonymizes your personal details,
                    and keeps historical booking records for business reporting.
                  </p>
                </div>
                <Button
                  color="error"
                  startIcon={<DeleteForever />}
                  variant="outlined"
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{
                    alignSelf: { xs: 'flex-start', md: 'center' },
                    borderRadius: '9999px',
                    minHeight: 44,
                    paddingInline: 3,
                    textTransform: 'none',
                  }}
                >
                  Delete account
                </Button>
              </div>
            </section>
          </section>
        ) : (
          <Alert severity="error">Could not load your account details.</Alert>
        )}
      </div>

      <Notification
        message={notice?.message ?? ''}
        open={Boolean(notice)}
        type={notice?.type ?? 'info'}
        onClose={() => setNotice(null)}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deletingAccount) setDeleteDialogOpen(false);
        }}
      >
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your login will be disabled and your personal details will be
            anonymized. Existing booking records will remain for operational
            and reporting purposes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={deletingAccount}
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="error"
            loading={deletingAccount}
            onClick={deleteAccount}
            variant="contained"
          >
            Delete account
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
