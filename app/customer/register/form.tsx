'use client';

import AuthSubmitButton from '@/app/components/auth/auth-submit-button';
import AuthTextField from '@/app/components/auth/auth-text-field';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, Tooltip } from '@mui/material';
import Form from 'next/form';
import React from 'react';

interface RegisterFormProps {
  onRegister: (name: string, email: string, password: string) => void;
  submitting?: boolean;
}

const PASSWORD_CRITERIA_DESCRIPTION =
  'Use 8-20 characters with at least one uppercase letter, one lowercase letter, one number, and one special character.';

export default function RegisterForm(props: RegisterFormProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const passwordCriteria = [
    {
      label: '8 to 20 characters',
      met: password.length >= 8 && password.length <= 20,
    },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const passwordMeetsCriteria = passwordCriteria.every(
    (criterion) => criterion.met,
  );
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    passwordMeetsCriteria &&
    passwordsMatch &&
    !props.submitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    props.onRegister(name.trim(), email.trim(), password);
  };

  return (
    <Form action="" className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <AuthTextField
        autoComplete="name"
        disabled={props.submitting}
        label="Name"
        onChange={(e) => setName(e.target.value)}
        required
        type="text"
        value={name}
      />
      <AuthTextField
        autoComplete="email"
        disabled={props.submitting}
        label="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
        value={email}
      />
      <AuthTextField
        autoComplete="new-password"
        disabled={props.submitting}
        label="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    edge="end"
                    onClick={() => setShowPassword((current) => !current)}
                    onMouseDown={(event) => event.preventDefault()}
                    size="small"
                    sx={{ color: '#a1a1aa' }}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
        type={showPassword ? 'text' : 'password'}
        value={password}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
          <span>Password requirements</span>
          <Tooltip title={PASSWORD_CRITERIA_DESCRIPTION}>
            <IconButton
              aria-label="Password criteria"
              size="small"
              tabIndex={-1}
              sx={{ color: '#a1a1aa', padding: '2px' }}
            >
              <HelpOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs text-zinc-400 sm:grid-cols-2">
          {passwordCriteria.map((criterion) => {
            const Icon = criterion.met
              ? CheckCircleOutlineIcon
              : RadioButtonUncheckedIcon;

            return (
              <div
                className={
                  criterion.met
                    ? 'flex items-center gap-2 text-emerald-300'
                    : 'flex items-center gap-2 text-zinc-500'
                }
                key={criterion.label}
              >
                <Icon fontSize="small" />
                <span>{criterion.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <AuthTextField
        autoComplete="new-password"
        disabled={props.submitting}
        error={confirmPassword.length > 0 && !passwordsMatch}
        helperText={
          confirmPassword.length > 0 && !passwordsMatch
            ? 'Passwords do not match'
            : ' '
        }
        label="Repeat password"
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip
                  title={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <IconButton
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                    edge="end"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    onMouseDown={(event) => event.preventDefault()}
                    size="small"
                    sx={{ color: '#a1a1aa' }}
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
      />
      <AuthSubmitButton disabled={!canSubmit} loading={props.submitting}>
        Register
      </AuthSubmitButton>
    </Form>
  );
}
