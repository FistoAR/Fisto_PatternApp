import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EditorPage from './components/EditorPage'
import HomePage from './pages/HomePage'
import ModelsMockupPage from './pages/ModelsMockupPage'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen w-screen overflow-x-hidden bg-white">
        <Navbar/>
        <div className="flex-1 flex flex-col min-h-0 relative -mt-[5vh]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/modelsMockup" element={<ModelsMockupPage />} />
            <Route path="/editor" element={<EditorPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}


export default App
