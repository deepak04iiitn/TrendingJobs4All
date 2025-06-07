import React from 'react';
import { BrowserRouter , Routes , Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import Trends from './pages/Trends';
import FullJd from './pages/FullJd';
import MyJobs from './pages/MyJobs';
import PublicPolls from './pages/PublicPolls';
import MyPolls from './pages/MyPolls';
import InterviewExp from './pages/InterviewExp';
import SalaryStructures from './pages/SalaryStructures';
import Referrals from './pages/Referrals';
import ResumeReviews from './pages/ResumeReviews';
import ResumeTemplates from './pages/ResumeTemplates';
import MyCorner from './pages/MyCorner';
import PremiumSubscription from './pages/PremiumSubscription';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Jobs from './pages/Jobs';
import InterviewDetailPage from './pages/InterviewDetailPage';
import SalaryDetailPage from './pages/SalaryDetailPage';
import ReferralDetailPage from './pages/ReferralDetailPage';
import ResumeBuilder from './pages/ResumeBuilder';
import InterviewQuestions from './pages/InterviewQuestions';
import AdminInterviewQuestions from './pages/AdminInterviewQuestions';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/sign-in' element={<SignIn />} />
            <Route path='/sign-up' element={<SignUp />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/trends' element={<Trends />} />
            <Route path='/fulljd/:url/:id' element={<FullJd />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path='/publicpolls' element={<PublicPolls />} />
            <Route path="/mypolls" element={<MyPolls />} />
            <Route path="/interviewExp" element={<InterviewExp />} />
            <Route path="/interview-experiences" element={<InterviewExp />} />
            <Route path="/interview-experience/:id" element={<InterviewDetailPage />} />
            <Route path="/salaryStructures" element={<SalaryStructures />} />
            <Route path="/salary/:id" element={<SalaryDetailPage />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/referral/:id" element={<ReferralDetailPage />} />
            {/* <Route path="/resumeReviews" element={<ResumeReviews />} /> */}
            <Route path='/resumeTemplates' element={<ResumeTemplates />} />
            <Route path='/myCorner' element={<MyCorner />} />
            <Route element={<PrivateRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/admin/interview-questions' element={<AdminInterviewQuestions />} />
            </Route>
            <Route path='/BuyMeACoffee' element={<PremiumSubscription />} />
            <Route path='/contactUs' element={<ContactUs />} />
            <Route path='/privacyPolicy' element={<PrivacyPolicy />} />
            <Route path='/jobs' element={<Jobs />} />
            <Route path='/resume-builder' element={<ResumeBuilder />} />
            <Route path='/interview-questions' element={<InterviewQuestions />} />
            <Route path='/interview-questions/:topicSlug' element={<InterviewQuestions />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}