import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useParams } from 'react-router-dom';

const FollowersPage = () => {
  const { username } = useParams();

  const { data: followers = [], isLoading } = useQuery({
    queryKey: ['followers', username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/followers/${username}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  return (
    <section>
  {isLoading ? (
    <div className="flex h-full items-center justify-center p-10">
      <LoadingSpinner size="lg" />
    </div>
  ) : (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-green-200 bg-white px-6 py-4">
        <h2 className="text-lg font-bold tracking-wide text-gray-800">
          Followers
        </h2>
      </div>

      {/* Empty state */}
      {followers.length === 0 && (
        <div className="py-10 text-center text-gray-500">
          No followers yet.
        </div>
      )}

      {/* Followers list */}
      <div className="mx-auto max-w-[600px] space-y-4 px-4 py-6">
        {followers.map(({ _id, username, profileImg, fullName }) => (
          <Link
            key={_id}
            to={`/profile/${username}`}
            className="block rounded-xl border border-green-200 bg-white px-4 py-3 transition-all duration-300 hover:border-green-300 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="avatar">
                <div className="w-10 rounded-full ring ring-green-200 ring-offset-2 ring-offset-white">
                  <img
                    src={profileImg || "/avatar-placeholder.png"}
                    alt={username}
                  />
                </div>
              </div>

              {/* User Info */}
              <div>
                <p className="font-medium text-gray-800">@{username}</p>
                <p className="text-sm text-gray-500">{fullName}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )}
</section>

  );
};

export default FollowersPage;
