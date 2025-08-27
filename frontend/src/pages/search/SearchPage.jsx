import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const SearchPage = () => {
  const [query, setQuery] = useState('');

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/search?search_query=${query}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong!');
        }
        return data;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch users');
      }
    },
    enabled: !!query.trim(),
  });

  const {
    data: vacations = [],
    isLoading: isLoadingVacations,
    error: errorVacations,
  } = useQuery({
    queryKey: ['searchVacations', query],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/search/vacations?search_query=${query}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong!');
        }
        return data;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch vacations');
      }
    },
    enabled: !!query.trim(),
  });

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-2xl mx-auto px-6 pt-8'>
        {/* Enhanced Search Input */}
        <div className='relative mb-8 group'>
          <div className='absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500'></div>
          
          <div className='relative bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl group-focus-within:shadow-2xl group-focus-within:shadow-purple-500/10 transition-all duration-300'>
            <input
              type='text'
              value={query}
              onChange={handleSearchChange}
              placeholder='Search for amazing people...'
              className='w-full pl-14 pr-6 py-4 text-lg bg-white rounded-2xl focus:outline-none text-gray-800 placeholder-gray-500 transition-all duration-300'
            />
            
            {/* Enhanced Search Icon */}
            <div className='absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 group-focus-within:from-purple-200 group-focus-within:to-blue-200 transition-all duration-300'>
              <Search className='w-5 h-5 text-purple-600 group-focus-within:scale-110 transition-transform duration-300' />
            </div>

            {/* Search suggestions indicator */}
            {query.trim() && (
              <div className='absolute top-1/2 right-4 -translate-y-1/2'>
                <div className='w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse'></div>
              </div>
            )}
          </div>

          {/* Search hint */}
          <p className='text-sm text-gray-500 mt-3 text-center opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'>
            Press Enter to search or start typing to see suggestions
          </p>
        </div>

        {/* Search Results Container */
        }
        {query.trim() && (
          <div className='bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden'>
            {/* Loading State */}
            {isLoading && (
              <div className='flex items-center justify-center p-8'>
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <div className='w-8 h-8 border-4 border-purple-200 rounded-full animate-spin'></div>
                    <div className='absolute top-0 left-0 w-8 h-8 border-4 border-purple-600 rounded-full animate-spin border-t-transparent'></div>
                  </div>
                  <span className='text-gray-600 font-medium'>Searching for users...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className='p-8 text-center'>
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <div className='text-2xl text-red-500'>⚠️</div>
                </div>
                <p className='text-red-600 font-medium'>Oops! Something went wrong</p>
                <p className='text-red-500 text-sm mt-1'>{error.message}</p>
              </div>
            )}

            {/* No Results State */}
            {!isLoading && !error && users.length === 0 && (
              <div className='p-8 text-center'>
                <div className='w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                  <div className='text-3xl text-gray-400'>🔍</div>
                </div>
                <h3 className='text-lg font-bold text-gray-800 mb-2'>No users found</h3>
                <p className='text-gray-600 max-w-md mx-auto leading-relaxed'>
                  We couldn't find anyone matching "<span className='font-semibold text-purple-600'>{query}</span>". 
                  Try a different search term.
                </p>
              </div>
            )}

            {/* Enhanced Results List */}
            {!isLoading && !error && users.length > 0 && (
              <div className='divide-y divide-gray-100'>
                {/* Results header */}
                <div className='px-6 py-4 bg-gray-50 border-b border-gray-100'>
                  <p className='text-sm font-semibold text-gray-700'>
                    Found {users.length} user{users.length !== 1 ? 's' : ''} matching "{query}"
                  </p>
                </div>

                {/* User Results */}
                <div className='max-h-96 overflow-y-auto'>
                  {users.map((user, index) => (
                    <Link
                      key={user._id}
                      to={`/profile/${user.username}`}
                      className='block group hover:bg-gray-50 transition-all duration-300'
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <div className='p-4 flex items-center gap-4'>
                        {/* Enhanced Avatar */}
                        <div className='relative group/avatar'>
                          <div className='w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-gray-100 shadow-lg group-hover:ring-purple-200 group-hover:shadow-xl transition-all duration-300'>
                            <img
                              src={user.profileImg || '/avatar-placeholder.png'}
                              alt={user.fullName}
                              className='w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500'
                            />
                          </div>
                          
                          {/* Online indicator */}
                          <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg'></div>
                        </div>

                        {/* Enhanced User Info */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 truncate'>
                              {user.fullName}
                            </h3>
                            {/* Verified badge */}
                            <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                              <svg className='w-2.5 h-2.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                              </svg>
                            </div>
                          </div>
                          
                          <p className='text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300 flex items-center gap-2'>
                            <span>@{user.username}</span>
                            <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                            <span className='text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium'>
                              Active
                            </span>
                          </p>

                          {/* Additional user info */}
                          {user.bio && (
                            <p className='text-xs text-gray-500 mt-2 line-clamp-2 group-hover:text-gray-600 transition-colors duration-300'>
                              {user.bio}
                            </p>
                          )}
                        </div>

                        {/* Action Indicators */}
                        <div className='flex items-center gap-2'>
                          {/* Follow button */}
                          <button 
                            className='px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100'
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Follow user:', user.username);
                            }}
                          >
                            Follow
                          </button>

                          {/* Arrow indicator */}
                          <div className='text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300'>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Hover gradient overlay */}
                      <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'></div>
                    </Link>
                  ))}
                </div>

                {/* Results footer */}
                {users.length >= 3 && (
                  <div className='px-6 py-4 bg-gray-50 text-center'>
                    <p className='text-sm text-gray-600'>
                      Showing first {users.length} results. 
                      <button className='text-purple-600 hover:text-purple-700 font-medium ml-1 hover:underline transition-all duration-300'>
                        View all results
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Vacations Results */}
            {!isLoadingVacations && !errorVacations && vacations.length > 0 && (
              <div className='border-t border-gray-100'>
                <div className='px-6 py-4 bg-gray-50 border-b border-gray-100'>
                  <p className='text-sm font-semibold text-gray-700'>
                    Found {vacations.length} vacation{vacations.length !== 1 ? 's' : ''} matching "{query}"
                  </p>
                </div>

                <div className='max-h-96 overflow-y-auto divide-y divide-gray-100'>
                  {vacations.map((vacation) => (
                    <Link
                      key={vacation._id}
                      to={`/vacations/${vacation._id}`}
                      className='block group hover:bg-gray-50 transition-all duration-300'
                    >
                      <div className='p-4 flex items-center gap-4'>
                        <div className='w-20 h-14 rounded-xl overflow-hidden ring-4 ring-gray-100 shadow-lg group-hover:ring-purple-200 group-hover:shadow-xl transition-all duration-300'>
                          <img
                            src={(vacation.images && vacation.images[0]) || '/cover-placeholder.png'}
                            alt={vacation.name}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 truncate'>
                            {vacation.name}
                          </h3>
                          <p className='text-sm text-gray-500 truncate'>
                            {vacation.location}
                          </p>
                          {vacation.creator && (
                            <p className='text-xs text-gray-400 mt-1 truncate'>
                              by {vacation.creator.fullName || vacation.creator.username}
                            </p>
                          )}
                        </div>
                        <div className='text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300'>
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Tips */}
        {!query.trim() && (
          <div className='mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200'>
            <h3 className='text-lg font-bold text-gray-800 mb-3 flex items-center gap-2'>
              <div className='w-2 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full'></div>
              Search Tips
            </h3>
            <div className='grid md:grid-cols-2 gap-4 text-sm text-gray-600'>
              <div className='flex items-start gap-3'>
                <div className='w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <span className='text-xs'>💡</span>
                </div>
                <div>
                  <p className='font-medium text-gray-700'>Use full names</p>
                  <p>Search by first name, last name, or both</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <span className='text-xs'>@</span>
                </div>
                <div>
                  <p className='font-medium text-gray-700'>Try usernames</p>
                  <p>Include @ symbol for exact username matches</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SearchPage;
