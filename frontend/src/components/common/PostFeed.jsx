import PostCard from './PostCard';
import PostSkeleton from '../skeletons/PostSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ImageModal from './ImageModal';

const PostFeed = ({ feedType, username, userId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const getPostEndPoint = () => {
    switch (feedType) {
      case 'forYou':
        return '/api/posts/all';
      case 'following':
        return '/api/posts/following';
      case 'posts':
        return `/api/posts/user/${username}`;
      case 'likes':
        return `/api/posts/likes/${userId}`;
      default:
        return '/api/posts/all';
    }
  };

  const POST_ENDPOINT = getPostEndPoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong!');
        }
        return data;
      } catch (error) {
        throw new Error(error.message, 'Something went wrong!');
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  const handleImageClick = (imageUrl, imageAlt = 'Post image') => {
    setSelectedImage({ url: imageUrl, alt: imageAlt });
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
  {(isLoading || isRefetching) && (
    <div className="flex flex-col justify-center gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )}

  {!isLoading && !isRefetching && posts?.length === 0 && (
    <p className="text-center my-4 text-gray-700 bg-green-100 rounded-xl py-3 px-4 shadow-sm">
      No posts shared here yet... try another tab 🌙
    </p>
  )}

  {!isLoading && !isRefetching && posts && (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-2xl border border-green-200 shadow-md hover:shadow-lg hover:border-green-300 transition-all duration-300"
        >
          <PostCard
            post={post}
            onImageClick={handleImageClick}
          />
        </div>
      ))}
    </div>
  )}

  {/* Image Modal for Zoom */}
  {isImageModalOpen && selectedImage && (
    <ImageModal
      image={selectedImage}
      isOpen={isImageModalOpen}
      onClose={closeImageModal}
    />
  )}
</>


  );
};

export default PostFeed;
