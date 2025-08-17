import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers/formatDate';

import { UserPlus, Heart, MoreVertical, MapPin, Calendar } from 'lucide-react';

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', authUser._id],
    queryFn: async () => {
      try {
        const res = await fetch('/api/notifications', {
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    enabled: !!authUser?._id,
  });

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/notifications/', {
          method: 'DELETE',
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong!');
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: () => {
      toast.success('Notifications deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['notifications', authUser?._id],
      });
    },
  });

  const { mutate: deleteNotification, isPending: isDeletingNotification } = useMutation({
    mutationFn: async (notificationId) => {
      try {
        const res = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong!');
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: () => {
      toast.success('Notification deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['notifications', authUser?._id],
      });
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete notification');
    },
  });

  // Helper function để render notification content
  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'follow':
        return {
          icon: <UserPlus className='w-6 h-6' />,
          iconBg: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600',
          content: 'started following you',
          badge: { text: 'New Follower', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
          link: `/profile/${notification.from.username}`
        };
      case 'like':
        return {
          icon: <Heart className='w-6 h-6' />,
          iconBg: 'bg-gradient-to-r from-pink-100 to-red-100 text-red-500',
          content: 'liked your post',
          badge: { text: 'Post Liked', bg: 'bg-pink-50 text-pink-700 border-pink-200' },
          link: `/profile/${notification.from.username}`
        };
      case 'vacation_invitation':
        return {
          icon: <MapPin className='w-6 h-6' />,
          iconBg: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-600',
          content: 'invited you to join a vacation',
          badge: { text: 'Vacation Invitation', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          link: `/vacations/${notification.vacation?._id}`
        };
      default:
        return {
          icon: <UserPlus className='w-6 h-6' />,
          iconBg: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600',
          content: 'interacted with you',
          badge: { text: 'New Activity', bg: 'bg-gray-50 text-gray-700 border-gray-200' },
          link: `/profile/${notification.from.username}`
        };
    }
  };

  return (
    <section className='flex-[4_4_0] min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden'>
    {/* Floating background elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-xl animate-pulse delay-2000"></div>
    </div>
  
    {/* Enhanced Header */}
    <div className='sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg'>
      <div className='flex justify-between items-center px-6 py-5'>
        <div className='flex items-center gap-3'>
          <div className='w-2 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full'></div>
          <h2 className='text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
            Notifications
          </h2>
          {notifications?.length > 0 && (
            <div className='bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg'>
              {notifications.length}
            </div>
          )}
        </div>
  
        <div className='dropdown dropdown-end'>
          <button 
            tabIndex={0} 
            className='btn btn-ghost btn-sm p-3 rounded-xl hover:bg-white/50 hover:shadow-lg transition-all duration-300 group'
          >
            <MoreVertical className='w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors duration-300' />
          </button>
          <ul
            tabIndex={0}
            className='dropdown-content menu bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl w-56 shadow-2xl mt-2 overflow-hidden'
          >
            <li>
              <button 
                onClick={deleteNotifications}
                className='px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-300 flex items-center gap-3'
              >
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                Delete all notifications
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  
    {/* Loading State */}
    {isLoading && (
      <div className='flex flex-col justify-center items-center h-96 p-10'>
        <div className='relative'>
          <div className='w-16 h-16 border-4 border-purple-200 rounded-full animate-spin'></div>
          <div className='absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent'></div>
        </div>
        <p className='text-gray-600 mt-4 font-medium'>Loading notifications...</p>
      </div>
    )}
  
    {/* Empty State */}
    {!isLoading && notifications.length === 0 && (
      <div className='flex flex-col items-center justify-center h-96 text-center px-6'>
        <div className='w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-lg'>
          <div className='text-4xl text-gray-400'>🔔</div>
        </div>
        <h3 className='text-xl font-bold text-gray-800 mb-2'>All caught up!</h3>
        <p className='text-gray-600 max-w-md leading-relaxed'>
          No activity yet. Enjoy the quiet while it lasts.
        </p>
      </div>
    )}
  
    {/* Enhanced Notifications List */}
    <div className='max-w-2xl mx-auto px-6 py-8 space-y-4 relative z-10'>
      {!isLoading &&
        notifications.map((notification, index) => {
          const notificationData = renderNotificationContent(notification);
          
          return (
            <Link
              key={notification._id}
              to={notificationData.link}
              className='block group'
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className='bg-white/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] overflow-hidden'>
                <div className='p-6'>
                  <div className='flex items-start gap-4'>
                    {/* Enhanced Icon */}
                    <div className='relative'>
                      <div className={`p-3 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 ${notificationData.iconBg}`}>
                        {notificationData.icon}
                      </div>
                      {/* Notification dot */}
                      <div className='absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse'></div>
                    </div>
  
                    {/* Enhanced Details */}
                    <div className='flex-1'>
                      <div className='flex items-start gap-4'>
                        {/* Enhanced Avatar */}
                        <div className='relative group/avatar'>
                          <div className='w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-lg group-hover/avatar:ring-purple-200 transition-all duration-300'>
                            <img
                              src={
                                notification.from.profileImg ||
                                '/avatar-placeholder.png'
                              }
                              alt={`${notification.from.username} avatar`}
                              className='w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500'
                            />
                          </div>
                          {/* Online indicator */}
                          <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg'></div>
                        </div>
  
                        {/* Enhanced Content */}
                        <div className='flex-1 min-w-0'>
                          <div className='mb-2'>
                            <span className='text-base leading-relaxed text-gray-800'>
                              <span className='font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-blue-700 transition-all duration-300'>
                                @{notification.from.username}
                              </span>{' '}
                              <span className='text-gray-700'>
                                {notificationData.content}
                              </span>
                              <span className='text-purple-500 font-medium'>.</span>
                            </span>
                          </div>

                          {/* Vacation details for vacation_invitation */}
                          {notification.type === 'vacation_invitation' && notification.vacation && (
                            <div className='mb-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/30'>
                              <div className='flex items-center gap-2 mb-2'>
                                <MapPin className='w-4 h-4 text-emerald-600' />
                                <span className='font-semibold text-emerald-800'>{notification.vacation.name}</span>
                              </div>
                              <div className='flex items-center gap-2 text-sm text-emerald-700'>
                                <Calendar className='w-4 h-4' />
                                <span>{new Date(notification.vacation.startDate).toLocaleDateString('vi-VN')} - {new Date(notification.vacation.endDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Enhanced timestamp */}
                          <div className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 bg-gray-400 rounded-full'></div>
                            <span className='text-sm text-gray-500 font-medium'>
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
  
                      {/* Action indicator */}
                      <div className='mt-4 flex items-center justify-between'>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border ${notificationData.badge.bg}`}>
                          {notificationData.icon}
                          {notificationData.badge.text}
                        </div>
                        
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this notification?')) {
                              deleteNotification(notification._id);
                            }
                          }}
                          className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 group/delete'
                          title='Delete notification'
                          disabled={isDeletingNotification}
                        >
                          {isDeletingNotification ? (
                            <div className='w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin'></div>
                          ) : (
                            <svg className='w-4 h-4 group-hover/delete:scale-110 transition-transform duration-200' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Hover gradient border */}
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'></div>
              </div>
            </Link>
          );
        })}
    </div>
  
    {/* Scroll to top button */}
    {notifications?.length > 5 && (
      <button 
        className='fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/25 hover:scale-110 transition-all duration-300 z-20 flex items-center justify-center group'
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg className='w-6 h-6 group-hover:-translate-y-0.5 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
        </svg>
      </button>
    )}
  </section>
  );
};

export default NotificationPage;
