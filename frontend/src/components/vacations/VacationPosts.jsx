import React from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import PostCard from '../common/PostCard';
import LoadingSpinner from '../common/LoadingSpinner';

const VacationPosts = ({ 
  posts = [], 
  isLoading = false, 
  onAddPost, 
  showAddButton = true 
}) => {
  // Debug logging
  console.log('VacationPosts received posts:', posts);
  console.log('Posts type:', typeof posts);
  console.log('Posts length:', posts?.length);

  // Filter out null/undefined posts and ensure they have _id
  const validPosts = posts.filter(post => {
    const isValid = post && post._id;
    if (!isValid) {
      console.log('Invalid post found:', post);
    }
    return isValid;
  });

  console.log('Valid posts after filtering:', validPosts.length);

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Bài viết liên quan</h3>
        {showAddButton && onAddPost && (
          <button
            onClick={onAddPost}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus size={16} />
            Thêm bài viết
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : validPosts.length === 0 ? (
        <div className="text-center py-8">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Chưa có bài viết nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {validPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VacationPosts;
