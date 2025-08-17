import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const useUserProfileUpdate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData) => {
        try {
          const res = await fetch('/api/users/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Something went wrong');
          }

          return data;
        } catch (error) {
          throw new Error(error.message);
        }
      },

      onSuccess: (updatedUser) => {
        toast.success('Profile updated successfully');
        
        // Update authUser cache immediately
        queryClient.setQueryData(['authUser'], updatedUser);
        
        // Invalidate and refetch userProfile queries
        queryClient.invalidateQueries({ 
          queryKey: ['userProfile'],
          exact: false 
        });
        
        // Also invalidate authUser to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['authUser'] });
      },

      onError: (error) => {
        toast.error(error.message);
      },
    });

  return { updateProfile, isUpdatingProfile };
};

export default useUserProfileUpdate;
