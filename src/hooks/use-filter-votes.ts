import { api } from "../trpc/client";
import { useToast } from "@/hooks/use-toast";
import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "@/server/trpc/routers/_app";

export function useFilterVotes() {
  const { toast } = useToast();
  const utils = api.useContext();

  const { mutate: voteMutation, isPending: isVoting } =
    api.vote.vote.useMutation({
      onSuccess: () => {
        utils.filter.getAll.invalidate();
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const { mutate: removeVoteMutation, isPending: isRemoving } =
    api.vote.removeVote.useMutation({
      onSuccess: () => {
        utils.filter.getAll.invalidate();
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const vote = async (filterId: string, value: 1 | -1) => {
    try {
      await voteMutation({ filterId, value });
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeVote = async (filterId: string) => {
    try {
      await removeVoteMutation({ filterId });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    isLoading: isVoting || isRemoving,
    vote,
    removeVote,
  };
}
