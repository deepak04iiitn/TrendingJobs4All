import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { CircularProgressbar } from 'react-circular-progressbar';
import { Helmet } from 'react-helmet-async';
import {
  Camera,
  LogOut,
  Trash2,
  Mail,
  User,
  Lock,
  CornerDownLeft,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import 'react-circular-progressbar/dist/styles.css';
import { app } from '../firebase.js';
import {
  updateFailure,
  updateStart,
  updateSuccess,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice.js';
import { focusRing } from '../theme/tokens';

export default function Profile() {
  const { currentUser, error } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const filePickerRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!imageFile) return;

    setImageFileUploading(true);
    setImageFileUploadError(null);

    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      () => {
        setImageFileUploadError('Could not upload image (file must be less than 2MB)');
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData((prev) => ({ ...prev, profilePicture: downloadURL }));
          setImageFileUploading(false);
          setImageFileUploadProgress(null);
        });
      },
    );
  }, [imageFile]);

  if (!currentUser) {
    return <Navigate to="/sign-in?redirect=/profile" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made');
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError('Please wait for the image to finish uploading');
      return;
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`/backend/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess('Profile updated successfully');
        setFormData({});
      }
    } catch (err) {
      dispatch(updateFailure(err.message));
      setUpdateUserError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/backend/user/delete/${currentUser._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
        navigate('/sign-in');
      }
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/backend/user/signout', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        dispatch(signoutSuccess());
        navigate('/sign-in');
      } else {
        console.log(data.message);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const displayName = formData.username || currentUser.username || 'Member';
  const avatarSrc = imageFileUrl || currentUser.profilePicture;

  return (
    <>
      <Helmet>
        <title>{`${displayName} · Profile | Route2Hire`}</title>
        <meta
          name="description"
          content="Manage your Route2Hire account — photo, username, email, and password for your QA & SDET career workspace."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://route2hire.com/profile" />
      </Helmet>

      <div className="relative min-h-screen overflow-hidden bg-[#F7F3EC]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 15% 0%, rgba(196,165,116,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 95% 30%, rgba(239,232,220,0.9), transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
          {/* Identity masthead — not a card stack */}
          <header className="mb-10 border-b border-[#E5DCCE] pb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6B5A48]">
              Account
            </p>
            <div className="mt-5 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <button
                  type="button"
                  onClick={() => filePickerRef.current?.click()}
                  className={`group relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_12px_40px_-20px_rgba(44,36,27,0.35)] sm:h-36 sm:w-36 ${focusRing}`}
                  aria-label="Change profile photo"
                >
                  {imageFileUploadProgress && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#FFFDF8]/90">
                      <div className="h-16 w-16">
                        <CircularProgressbar
                          value={imageFileUploadProgress || 0}
                          text={`${imageFileUploadProgress}%`}
                          strokeWidth={6}
                          styles={{
                            path: { stroke: '#C4A574' },
                            text: { fill: '#2C241B', fontSize: '22px', fontWeight: 600 },
                            trail: { stroke: '#E5DCCE' },
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <img
                    src={avatarSrc}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-[#2C241B]/75 py-2 text-[11px] font-medium text-[#FFFDF8] opacity-0 transition group-hover:opacity-100">
                    <Camera className="h-3.5 w-3.5" /> Photo
                  </span>
                </button>

                <div className="min-w-0 pb-1">
                  <h1 className="font-display text-3xl font-semibold leading-[1.15] text-[#1C1917] sm:text-4xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#57534E]">
                    <Mail className="h-3.5 w-3.5 text-[#C4A574]" aria-hidden />
                    <span className="truncate">{currentUser.email}</span>
                  </p>
                  {currentUser.isUserAdmin && (
                    <span className="mt-3 inline-flex rounded-full border border-[#C4A574]/40 bg-[#F7F3EC] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B5A48]">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/myCorner"
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3.5 py-2 text-xs font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                >
                  <CornerDownLeft className="h-3.5 w-3.5" />
                  My Corner
                </Link>
                <Link
                  to="/jobs"
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3.5 py-2 text-xs font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Browse jobs
                </Link>
              </div>
            </div>
          </header>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={filePickerRef}
            hidden
          />

          <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
            {/* Details column */}
            <section>
              <h2 className="font-display text-xl font-semibold text-[#1C1917]">Details</h2>
              <p className="mt-1 text-sm text-[#78716C]">How you appear across Route2Hire.</p>

              <div className="mt-6 space-y-5">
                <Field
                  id="username"
                  label="Username"
                  icon={User}
                  type="text"
                  defaultValue={currentUser.username}
                  onChange={handleChange}
                />
                <Field
                  id="email"
                  label="Email"
                  icon={Mail}
                  type="email"
                  defaultValue={currentUser.email}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Security column */}
            <section className="lg:border-l lg:border-[#E5DCCE] lg:pl-10">
              <h2 className="font-display text-xl font-semibold text-[#1C1917]">Security</h2>
              <p className="mt-1 text-sm text-[#78716C]">Leave blank to keep your current password.</p>

              <div className="mt-6">
                <Field
                  id="password"
                  label="New password"
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={imageFileUploading}
                className={`mt-8 w-full rounded-xl bg-[#2C241B] px-5 py-3 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] disabled:opacity-50 ${focusRing}`}
              >
                {imageFileUploading ? 'Uploading photo…' : 'Save changes'}
              </button>

              {(updateUserSuccess || error || updateUserError || imageFileUploadError) && (
                <div className="mt-4 space-y-2">
                  {updateUserSuccess && (
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2.5 text-sm text-emerald-800">
                      {updateUserSuccess}
                    </p>
                  )}
                  {(error || updateUserError) && (
                    <p className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2.5 text-sm text-rose-800">
                      {error || updateUserError}
                    </p>
                  )}
                  {imageFileUploadError && (
                    <p className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2.5 text-sm text-rose-800">
                      {imageFileUploadError}
                    </p>
                  )}
                </div>
              )}
            </section>
          </form>

          {/* Session + danger — flat strip, not competing cards */}
          <div className="mt-14 grid gap-4 border-t border-[#E5DCCE] pt-8 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSignout}
              className={`flex items-center gap-3 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-4 text-left transition hover:bg-[#F7F3EC] ${focusRing}`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F3EC] text-[#6B5A48]">
                <LogOut className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-[#1C1917]">Sign out</span>
                <span className="block text-[12px] text-[#78716C]">End this session on this device</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-3 rounded-2xl border border-rose-200/80 bg-[#FFFDF8] px-4 py-4 text-left transition hover:bg-rose-50/50 ${focusRing}`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Trash2 className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-rose-700">Delete account</span>
                <span className="block text-[12px] text-[#78716C]">Permanently remove your data</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-[#2C241B]/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-6 shadow-2xl sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-display mt-4 text-xl font-semibold text-[#1C1917]">Delete account?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
              This permanently deletes your account and related data. This cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`rounded-xl border border-[#E5DCCE] px-4 py-2.5 text-sm font-medium text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
              >
                Keep account
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className={`rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 ${focusRing}`}
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ id, label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
        {label}
      </span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4A574]" aria-hidden />
        <input
          id={id}
          {...props}
          className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-3 pl-10 pr-3 text-sm text-[#2C241B] outline-none transition placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/25 ${focusRing}`}
        />
      </span>
    </label>
  );
}
