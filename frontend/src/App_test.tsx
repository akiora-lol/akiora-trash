import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Globe1 from './components/mvpblocks/globe1';
import GradientHero from './components/mvpblocks/gradient-hero';
import ProfilePage from './pages/Profile';
import ProfilePageNew from './pages/ProfileNew';
import CreateMatch from './pages/CreateMatch';
import CreateMatchNew from './pages/CreateMatchNew';
import Login from './pages_new/Login';
import Register from './pages/Register';
import Header1 from './components/mvpblocks/header-1';
import MultiStepForm from './macro-components/multi-step-form';
import FooterGlow from './components/mvpblocks/footer-glow';
import { Toaster } from '@/components/ui/sonner';
import MatchesFeed from './pages/MatchesFeed';
import MatchesFeedNew from './pages/MatchesFeedNew';
import ChatList from './pages/ChatList';
import Chat from './pages/Chat';
import { GlowyWavesHero } from './components/uitripled/glowy-waves-hero-shadcnui';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Header1/>
       
        <main>
          <Routes>
            <Route path="/" element={<GlowyWavesHero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hr" element={<GradientHero />} />
            <Route path="/profile" element={<ProfilePageNew />} />
            <Route path="/profile-old" element={<ProfilePage />} />
            <Route path="/qwer" element={<MultiStepForm />} />
            <Route path="/matches" element={<MatchesFeedNew />} />
            <Route path="/matches-old" element={<MatchesFeed />} />
            <Route path="/matchesf" element={<MatchesFeed />} />
            <Route path="/matches/create" element={<CreateMatchNew />} />
            <Route path="/matches/create-old" element={<CreateMatch />} />
            <Route path="/home" element={<Globe1 />} />
          </Routes>
        </main>
        {/* <FooterGlow/> */}
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App
