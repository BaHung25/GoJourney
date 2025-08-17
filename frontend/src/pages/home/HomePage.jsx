import { useState } from 'react';
import PostFeed from '../../components/common/PostFeed';
import CreatePost from './CreatePost';

const HomePage = () => {
  const [feedType, setFeedType] = useState('forYou');

  return (
    <main className="flex-[3_3_0] min-h-screen mx-auto border-x border-white/20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 text-gray-900">
  {/* Top Navbar */}
  <div className="sticky top-0 z-10 border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm">
    <div className="flex flex-col items-center gap-3 px-4 py-4 md:flex-row">
      {/* Feed Toggle */}
      <div className="flex gap-3">
        <button
          className={`px-6 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${
            feedType === 'forYou'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md scale-105'
              : 'bg-white/70 hover:bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
          onClick={() => setFeedType('forYou')}
        >
          For You
        </button>
        <button
          className={`px-6 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${
            feedType === 'following'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md scale-105'
              : 'bg-white/70 hover:bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
          onClick={() => setFeedType('following')}
        >
          Following
        </button>
      </div>
    </div>
  </div>

  {/* Feed Content */}
  <div className="mx-auto flex w-full max-w-[600px] flex-col gap-6 px-4 py-6">
    <div className="rounded-2xl border border-white/30 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
      <CreatePost />
    </div>
    <div className="rounded-2xl border border-white/30 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
      <PostFeed feedType={feedType} />
    </div>
  </div>
</main>

  );
};

export default HomePage;
