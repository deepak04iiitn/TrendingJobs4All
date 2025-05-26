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



export default function App() {
  return (
    <BrowserRouter>

    <Header />

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
            <Route path="/referrals" element={<Referrals />} />
            {/* <Route path="/resumeReviews" element={<ResumeReviews />} /> */}
            <Route path='/resumeTemplates' element={<ResumeTemplates />} />
            <Route path='/myCorner' element={<MyCorner />} />
            <Route element={<PrivateRoute />}>
              <Route path='/dashboard' element={<Dashboard />}></Route>        {/* making dashboard private */}
            </Route>
            <Route path='/BuyMeACoffee' element={<PremiumSubscription />} />
            <Route path='/contactUs' element={<ContactUs />} />
            <Route path='/privacyPolicy' element={<PrivacyPolicy />} />
            <Route path='/jobs' element={<Jobs />} />
        </Routes>

    <Footer />
    
    </BrowserRouter>
  )
}