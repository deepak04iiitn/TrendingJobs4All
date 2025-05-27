import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { CircularProgressbar } from 'react-circular-progressbar';
import { Camera, LogOut, Trash2, Building, Mail, User, Edit3, Shield, Star } from 'lucide-react';
import 'react-circular-progressbar/dist/styles.css';
import { app } from '../firebase.js';
import { 
  updateFailure, 
  updateStart, 
  updateSuccess, 
  deleteUserStart, 
  deleteUserSuccess, 
  deleteUserFailure, 
  signoutSuccess 
} from '../redux/user/userSlice.js';

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
      <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-violet-400 transition-all duration-300" />
    </div>
    <input
      {...props}
      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400/50 dark:focus:border-violet-400/50 transition-all duration-300 hover:border-violet-300/50 text-slate-700 dark:text-slate-200 placeholder-slate-400"
    />
    <label className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 tracking-wide">
      {label}
    </label>
  </div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "relative overflow-hidden px-8 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg";
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-violet-500/25 hover:shadow-violet-500/40",
    secondary: "bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50",
    danger: "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 text-white shadow-red-500/25 hover:shadow-red-500/40",
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className} group`} {...props}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <span className="relative z-10">{children}</span>
    </button>
  );
};

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

  const handleImageChange = async(e) => {
    const file = e.target.files[0];
    if(file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  }

  useEffect(() => {
    if(imageFile) {
      uploadImage();
    }
  }, [imageFile])

  const uploadImage = async() => {
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
      (error) => {
        setImageFileUploadError('Could not upload image (File must be less than 2MB');
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        })
      }
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    if(Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made!');
      return;
    }

    if(imageFileUploading) {
      setUpdateUserError('Please wait for image to upload!');
      return;
    }

    try {
      dispatch(updateStart());

      const res = await fetch(`/backend/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if(!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully!");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
    }
  }

  const handleDeleteUser = async () => {
    setShowModal(false);

    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/backend/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if(!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
        navigate('/sign-in');
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignout = async() => {
    try {
      const res = await fetch('/backend/user/signout', {
        method: 'POST',
      })

      const data = await res.json();

      if(!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        navigate('/sign-in');
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5 border border-white/20 dark:border-slate-800/50 p-8 transform transition-all duration-700 hover:shadow-violet-500/20">
          
          {/* Header Section */}
          <div className="relative mb-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
                  Profile Settings
                </h1>
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Manage your account and personal information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="relative w-48 h-48 mx-auto mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full animate-spin-slow blur-2xl opacity-30" />
              <div className="absolute inset-2 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 rounded-full blur-xl opacity-50" />
              
              <div 
                className="relative w-full h-full rounded-full cursor-pointer overflow-hidden group border-4 border-white dark:border-slate-800 shadow-2xl"
                onClick={() => filePickerRef.current.click()}
              >
                {imageFileUploadProgress && (
                  <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <CircularProgressbar
                        value={imageFileUploadProgress || 0}
                        text={`${imageFileUploadProgress}%`}
                        strokeWidth={6}
                        styles={{
                          root: { width: '80px', height: '80px' },
                          path: { 
                            stroke: 'url(#gradient)',
                            strokeLinecap: 'round',
                            transition: 'stroke-dashoffset 0.5s ease 0s'
                          },
                          text: { 
                            fill: '#8B5CF6', 
                            fontSize: '18px', 
                            fontWeight: '600' 
                          },
                        }}
                      />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">Uploading...</p>
                    </div>
                  </div>
                )}
                
                <img
                  src={imageFileUrl || currentUser.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Camera className="w-5 h-5" />
                    <span>Change Photo</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={filePickerRef}
              hidden
            />

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid gap-6">
                <Input
                  label="Username"
                  icon={User}
                  type="text"
                  id="username"
                  defaultValue={currentUser.username}
                  onChange={handleChange}
                />
                <Input
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  id="email"
                  defaultValue={currentUser.email}
                  onChange={handleChange}
                />
                <Input
                  label="New Password"
                  icon={Building}
                  type="password"
                  id="password"
                  placeholder="Enter new password"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-8">
              <Button type="submit" className="w-full text-lg py-5">
                Update Profile
              </Button>
              
              <Link to="/jobs" className="block">
                <Button variant="secondary" className="w-full text-lg py-5">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </form>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 text-red-500 hover:text-red-600 font-semibold transition-all duration-300 hover:scale-105 group"
            >
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-950/50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </div>
              Delete Account
            </button>
            
            <button
              onClick={handleSignout}
              className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold transition-all duration-300 hover:scale-105 group"
            >
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              Sign Out
            </button>
          </div>

          {/* Status Messages */}
          {(updateUserSuccess || error || updateUserError || imageFileUploadError) && (
            <div className="mt-8 space-y-4">
              {updateUserSuccess && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 text-emerald-800 font-medium backdrop-blur-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    {updateUserSuccess}
                  </div>
                </div>
              )}
              {(error || updateUserError) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 text-red-800 font-medium backdrop-blur-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {error || updateUserError}
                  </div>
                </div>
              )}
              {imageFileUploadError && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 text-red-800 font-medium backdrop-blur-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {imageFileUploadError}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20 dark:border-slate-800/50 transform animate-slideUp">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 p-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl">
                    <svg
                      className="w-full h-full text-white animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Delete Account</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="danger" onClick={handleDeleteUser} className="px-8">
                      Yes, Delete Forever
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)} className="px-8">
                      Keep Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}