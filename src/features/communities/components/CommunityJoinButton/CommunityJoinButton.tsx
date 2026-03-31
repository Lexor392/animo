import { useState } from 'react';
import type { CommunityJoinButtonProps } from '@/features/communities/components/CommunityJoinButton/CommunityJoinButton.types';
import { useJoinCommunity } from '@/features/communities/hooks/useJoinCommunity';
import { useLeaveCommunity } from '@/features/communities/hooks/useLeaveCommunity';
import { Button } from '@/shared/ui/Button/Button';

export const CommunityJoinButton = ({ community, currentUserId }: CommunityJoinButtonProps): JSX.Element => {
  const [localError, setLocalError] = useState<string | null>(null);
  const { errorMessage: joinErrorMessage, isLoading: isJoining, join } = useJoinCommunity();
  const { errorMessage: leaveErrorMessage, isLoading: isLeaving, leave } = useLeaveCommunity();

  if (community.viewer_role === 'owner') {
    return (
      <span className="inline-flex h-11 items-center justify-center rounded-2xl bg-amber-100 px-5 text-sm font-semibold text-amber-700">
        Owner
      </span>
    );
  }

  const handleClick = async (): Promise<void> => {
    setLocalError(null);

    try {
      if (community.is_member) {
        await leave({
          communityId: community.id,
          currentUserId,
          slug: community.slug,
        });
        return;
      }

      await join({
        communityId: community.id,
        currentUserId,
        slug: community.slug,
      });
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Unable to update community membership.');
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        isLoading={isJoining || isLeaving}
        variant={community.is_member ? 'secondary' : 'primary'}
        onClick={() => {
          void handleClick();
        }}
      >
        {community.is_member ? 'Leave' : 'Join'}
      </Button>

      {localError || joinErrorMessage || leaveErrorMessage ? (
        <p className="max-w-[240px] text-right text-xs text-rose-600">{localError || joinErrorMessage || leaveErrorMessage}</p>
      ) : null}
    </div>
  );
};
