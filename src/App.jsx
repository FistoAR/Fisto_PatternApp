import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import ModelsMockupPage from './pages/ModelsMockupPage'
import FeaturesPage from './pages/FeaturesPage'
import ContactPage from './pages/ContactPage'
import Navbar from './components/Navbar'
import Testing1Hero from './components/Testing1Hero'

function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const { pathname } = location;
  const isEditor = pathname === '/editor';

  return (
    <div className={`flex flex-col w-screen bg-white ${isEditor ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <div className={`flex-1 flex flex-col min-h-0 relative ${isEditor ? '' : '-mt-[5vh]'}`}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/modelsMockup" element={<ModelsMockupPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/testing1" element={<Testing1Hero />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  )
}


export default App
