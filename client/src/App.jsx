import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Channel from './pages/Channel';
import SubscriptionsPage from './pages/SubscriptionsPage';
import WatchlistPage from './pages/WatchlistPage';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenUpload = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setIsUploadOpen(true);
  };

  const handleUploadSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-red-500 selection:text-white">
      <Navbar onOpenUpload={handleOpenUpload} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />

        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <Routes>
            <Route path="/" element={<Home onOpenUpload={handleOpenUpload} />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/channel/:id" element={<Channel onOpenUpload={handleOpenUpload} />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
