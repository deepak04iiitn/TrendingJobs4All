import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import OAuth from '../components/OAuth';
import {
  AuthSeo,
  AuthShell,
  AuthField,
  SIGN_UP,
  SIGN_UP_SEO,
} from '../components/auth';
import { easeOut } from '../components/home/motion.jsx';
import { focusRing } from '../theme/tokens';
import '../styles/Auth.css';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const redirectParam = new URLSearchParams(location.search).get('redirect') || '';
  const signInHref = `/sign-in?redirect=${encodeURIComponent(redirectParam)}`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage('Please fill out all details!');
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/backend/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        return setErrorMessage(data.message);
      }

      setLoading(false);
      if (res.ok) {
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');
        navigate(redirect ? `/sign-in?redirect=${encodeURIComponent(redirect)}` : '/sign-in');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <AuthSeo seo={SIGN_UP_SEO} />

      <AuthShell content={SIGN_UP}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: easeOut }}
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1C1917] sm:text-3xl">
            {SIGN_UP.formTitle}
          </h2>
          <p className="mt-2 text-sm text-[#78716C]">
            Free account for QA, SDET and Test Automation professionals.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <AuthField
              id="username"
              label="Username"
              type="text"
              placeholder="Choose a username"
              onChange={handleChange}
              autoComplete="username"
            />

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
              placeholder="Create a password"
              onChange={handleChange}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className={`auth-submit mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#2C241B] px-6 py-3 text-sm font-semibold text-[#FFFDF8] ${focusRing}`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Creating account...
                </>
              ) : (
                SIGN_UP.submit
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
            {SIGN_UP.switchLabel}{' '}
            <Link to={signInHref} className={`auth-link ${focusRing}`}>
              {SIGN_UP.switchCta}
            </Link>
          </p>
        </motion.div>
      </AuthShell>
    </>
  );
}
