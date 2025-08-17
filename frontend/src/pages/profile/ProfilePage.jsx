import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import PostFeed from '../../components/common/PostFeed';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';
import EditProfileModal from './EditProfileModal';

import useFollow from '../../hooks/useFollow';
import useUserProfileUpdate from '../../hooks/useUserProfileUpdate';

import { formatMemberSinceDate } from '../../utils/helpers/formatDate';

import { ArrowLeft, Link as LucideLink, Calendar, Edit2 } from 'lucide-react';

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState('posts');

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { follow, isPending } = useFollow();
  const { username } = useParams();

  const { data: authUser } = useQuery({ queryKey: ['authUser'] });

  const {
    data: user,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong');
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    enabled: !!username,
  });

  const { updateProfile, isUpdatingProfile } = useUserProfileUpdate();

  const isMyProfile = authUser?._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const isUserFollowed = authUser?.following.includes(user?._id);

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  // Refetch when authUser changes (after profile update)
  useEffect(() => {
    if (isMyProfile && authUser) {
      refetch();
    }
  }, [authUser, isMyProfile, refetch]);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === 'coverImg' && setCoverImg(reader.result);
        state === 'profileImg' && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='flex-[4_4_0] min-h-screen bg-white'>
      {isLoading && isRefetching && isPending && <ProfileSkeleton />}
      {!isLoading && isRefetching && !user && (
        <p className='text-center text-lg mt-4 text-gray-600'>User not found</p>
      )}

      {!isLoading && !isRefetching && user && (
        <>
          {/* Header */}
          <div className='flex gap-6 p-6 items-center bg-white border-b border-gray-100 sticky top-0 z-20 backdrop-blur-sm bg-white/90'>
            <Link to='/'>
              <ArrowLeft className='w-5 h-5 text-gray-700 hover:text-green-600 transition-colors duration-200' />
            </Link>
            <div className='flex flex-col gap-0'>
              <p className='font-bold text-xl text-gray-900'>{user.fullName}</p>
              <p className='text-sm text-gray-500'>@{user.username}</p>
            </div>
          </div>

          {/* Cover Image */}
          <div className='relative group/cover'>
            <div className='h-60 w-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 relative overflow-hidden'>
              <img
                src={coverImg || user.coverImg || '/cover-placeholder.png'}
                className='h-full w-full object-cover mix-blend-overlay opacity-80'
                alt='Cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
            </div>
            {isMyProfile && (
              <div
                className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full cursor-pointer shadow-lg opacity-0 group-hover/cover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105'
                onClick={() => coverImgRef.current.click()}
              >
                <Edit2 className='text-green-600 w-5 h-5' />
              </div>
            )}
            <input
              type='file'
              hidden
              accept='image/*'
              ref={coverImgRef}
              onChange={(e) => handleImgChange(e, 'coverImg')}
            />
            <input
              type='file'
              hidden
              accept='image/*'
              ref={profileImgRef}
              onChange={(e) => handleImgChange(e, 'profileImg')}
            />

            {/* Avatar */}
            <div className='absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10'>
              <div className='avatar relative group/avatar'>
                <div className='w-32 h-32 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-white'>
                  <img
                    src={
                      profileImg || user.profileImg || '/avatar-placeholder.png'
                    }
                    alt='avatar'
                    className='w-full h-full object-cover'
                  />
                </div>
                {isMyProfile && (
                  <div
                    className='absolute top-2 right-2 bg-green-600 p-2 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer hover:bg-green-700 hover:scale-105'
                    onClick={() => {
                      profileImgRef.current.click();
                    }}
                  >
                    <Edit2 className='text-white w-4 h-4' />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className='bg-white mt-16 px-6 py-6 mx-auto w-full max-w-2xl relative'>
            <div className='flex flex-col items-center'>
              <div className='text-center mb-4'>
                <p className='text-2xl font-bold text-gray-900 mb-1'>{user.fullName}</p>
                <p className='text-base text-gray-500'>@{user.username}</p>
              </div>

              {user.bio && (
                <div className='bg-gray-50 rounded-lg p-4 mb-4 max-w-md'>
                  <p className='text-sm text-gray-700 text-center leading-relaxed'>
                    {user.bio}
                  </p>
                </div>
              )}

              <div className='flex flex-wrap gap-6 text-sm text-gray-600 justify-center mb-6'>
                {user.link && (
                  <div className='flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full'>
                    <LucideLink className='w-4 h-4 text-green-600' />
                    <a
                      href={user.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:text-green-600 transition-colors duration-200'
                    >
                      {user.link.replace('https://', '')}
                    </a>
                  </div>
                )}
                <div className='flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full'>
                  <Calendar className='w-4 h-4 text-green-600' />
                  <span>Joined {memberSinceDate}</span>
                </div>
              </div>

              {/* Edit Profile/ Follow  */}
              <div className='flex gap-3 mb-6'>
                {isMyProfile ? (
                  <>
                    <EditProfileModal authUser={authUser} />
                    {(coverImg || profileImg) && (
                      <button
                        className='bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105'
                        onClick={async () => {
                          try {
                            await updateProfile({ coverImg, profileImg });
                            setCoverImg(null);
                            setProfileImg(null);
                            // Force refetch to get updated data
                            refetch();
                          } catch (error) {
                            console.error('Error updating profile:', error);
                          }
                        }}
                      >
                        {isUpdatingProfile ? (
                          <span className='flex items-center gap-2'>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                            Updating...
                          </span>
                        ) : (
                          'Update Profile'
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 ${
                      isUserFollowed
                        ? 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    onClick={() => follow(user?._id)}
                  >
                    {isPending ? (
                      <span className='flex items-center gap-2'>
                        <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin'></div>
                        Loading...
                      </span>
                    ) : isUserFollowed ? (
                      'Unfollow'
                    ) : (
                      'Follow'
                    )}
                  </button>
                )}
              </div>

              {/* Followers & Following */}
              <div className='flex justify-center gap-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl w-full max-w-md border border-green-100'>
                <Link
                  to={`/profile/following/${user.username}`}
                  className='hover:cursor-pointer group'
                >
                  <div className='text-center transition-transform duration-200 group-hover:scale-105'>
                    <p className='text-2xl font-bold text-green-600 mb-1'>
                      {user.following.length}
                    </p>
                    <p className='text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-200'>
                      Following
                    </p>
                  </div>
                </Link>
                <div className='w-px bg-green-200'></div>
                <Link
                  to={`/profile/followers/${user.username}`}
                  className='hover:cursor-pointer group'
                >
                  <div className='text-center transition-transform duration-200 group-hover:scale-105'>
                    <p className='text-2xl font-bold text-green-600 mb-1'>
                      {user.followers.length}
                    </p>
                    <p className='text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-200'>
                      Followers
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex justify-center gap-2 mt-8 mb-6 px-4'>
            <div className='bg-gray-100 p-1 rounded-full'>
              <div
                onClick={() => setFeedType('posts')}
                className={`px-6 py-3 rounded-full cursor-pointer transition-all duration-300 font-medium ${
                  feedType === 'posts'
                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-green-600 hover:bg-white'
                }`}
              >
                Posts
              </div>
            </div>
            <div className='bg-gray-100 p-1 rounded-full'>
              <div
                onClick={() => setFeedType('likes')}
                className={`px-6 py-3 rounded-full cursor-pointer transition-all duration-300 font-medium ${
                  feedType === 'likes'
                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-green-600 hover:bg-white'
                }`}
              >
                Likes
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className='px-4 w-full max-w-2xl mx-auto flex flex-col gap-4 pb-8'>
            <PostFeed
              feedType={feedType}
              username={user?.username}
              userId={user?._id}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
