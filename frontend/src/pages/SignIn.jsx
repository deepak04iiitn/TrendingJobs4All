import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { signInStart, signInFailure, signInSuccess } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import {
  AuthSeo,
  AuthShell,
  AuthField,
  SIGN_IN,
  SIGN_IN_SEO,
} from '../components/auth';
import { easeOut } from '../components/home/motion.jsx';
import { focusRing } from '../theme/tokens';
import '../styles/Auth.css';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();

  const redirectParam = new URLSearchParams(location.search).get('redirect') || '';
  const signUpHref = `/sign-up?redirect=${encodeURIComponent(redirectParam)}`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill out all the fields!'));
    }

    try {
      dispatch(signInStart());
      const res = await fetch('/backend/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }

      if (res.ok) {
        dispatch(signInSuccess(data));
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/';
        navigate(redirect, { replace: true });
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <>
      <AuthSeo seo={SIGN_IN_SEO} />

      <AuthShell content={SIGN_IN}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: easeOut }}
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1C1917] sm:text-3xl">
            {SIGN_IN.formTitle}
          </h2>
          <p className="mt-2 text-sm text-[#78716C]">
            Access your QA and SDET career tools in one place.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <AuthField
              id="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              onChange={handleChange}
              autoComplete="email"
            />

            <AuthField
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              onChange={handleChange}
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              className={`auth-submit mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#2C241B] px-6 py-3 text-sm font-semibold text-[#FFFDF8] ${focusRing}`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Signing in...
                </>
              ) : (
                SIGN_IN.submit
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-[#E5DCCE]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.14em]">
                <span className="bg-[#FFFDF8] px-3 text-[#78716C]">Or continue with</span>
              </div>
            </div>

            <OAuth />
          </form>

          {errorMessage && (
            <div
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-[#57534E]">
            {SIGN_IN.switchLabel}{' '}
            <Link to={signUpHref} className={`auth-link ${focusRing}`}>
              {SIGN_IN.switchCta}
            </Link>
          </p>
        </motion.div>
      </AuthShell>
    </>
  );
}
