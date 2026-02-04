import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/auth/ProtectedLayout';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomizeProfile from './pages/CustomizeProfile';
import Home from './pages/Home';
import HomeFeed from './pages/HomeFeed';
import TweetFeed from './pages/TweetFeed';
import WatchHistory from './pages/WatchHistory';
import VideoView from './pages/VideoView';
import { ThemeProvider } from './context/ThemeContext';
import { FeedbackProvider } from './context/FeedbackContext';
import './VoxTheme.css';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import LikedVideos from './pages/LikedVideos';
import MyVideos from './pages/MyVideos';
import VideoManagement from './pages/VideoManagement';
import Subscriptions from './pages/Subscriptions';
import ChannelProfile from './pages/ChannelProfile';
import UploadVideo from './pages/UploadVideo';
import MyPlaylists from './pages/MyPlaylists';
import PlaylistManagement from './pages/PlaylistManagement';
import MyTweets from './pages/MyTweets';
import CreateTweet from './pages/CreateTweet';
import EditTweet from './pages/EditTweet';
import DeleteAllTweets from './pages/DeleteAllTweets';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <FeedbackProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedLayout />}>
                <Route path="/customize-profile" element={<CustomizeProfile />} />
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/videos" element={<HomeFeed />} />
                  <Route path="/tweets" element={<TweetFeed />} />
                  <Route path="/history" element={<WatchHistory />} />
                  <Route path="/video/:videoId" element={<VideoView />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/liked-videos" element={<LikedVideos />} />
                  <Route path="/my-videos" element={<MyVideos />} />
                  <Route path="/manage-video/:videoId" element={<VideoManagement />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/channel/:username" element={<ChannelProfile />} />
                  <Route path="/upload" element={<UploadVideo />} />
                  <Route path="/my-playlists" element={<MyPlaylists />} />
                  <Route path="/playlist/:playlistId" element={<PlaylistManagement />} />
                  <Route path="/my-tweets-vox" element={<MyTweets />} />
                  <Route path="/create-tweet" element={<CreateTweet />} />
                  <Route path="/edit-tweet/:tweetId" element={<EditTweet />} />
                  <Route path="/delete-all-tweets" element={<DeleteAllTweets />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </FeedbackProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
