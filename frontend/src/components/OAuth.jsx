import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { focusRing } from '../theme/tokens';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);

      const res = await fetch('/backend/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(signInSuccess(data));
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/';
        navigate(redirect, { replace: true });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className={`auth-oauth flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3 text-sm font-semibold text-[#2C241B] ${focusRing}`}
    >
      <AiFillGoogleCircle className="h-5 w-5 text-[#6B5A48]" aria-hidden />
      Continue with Google
    </button>
  );
}
