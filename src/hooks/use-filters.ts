import { api } from "../trpc/client";
import { useToast } from "@/hooks/use-toast";
import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "@/server/trpc/routers/_app";
import type { CreateFilterInput } from "@/types/api";

export function useFilters() {
  const { toast } = useToast();
  const utils = api.useContext();

  const { data: filters, isLoading: isLoadingFilters } =
    api.filter.getAll.useQuery();

  const { mutate: createFilterMutation, isLoading: isCreating } =
    api.filter.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Filter created successfully",
        });
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

  const { mutate: updateFilterMutation, isLoading: isUpdating } =
    api.filter.update.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Filter updated successfully",
        });
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

  const { mutate: deleteFilterMutation, isLoading: isDeleting } =
    api.filter.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Filter deleted successfully",
        });
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

  const createFilter = async (data: CreateFilterInput) => {
    try {
      await createFilterMutation(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateFilter = async (id: string, data: Partial<CreateFilterInput>) => {
    try {
      await updateFilterMutation({ id, ...data });
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteFilter = async (id: string) => {
    try {
      await deleteFilterMutation({ id });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    filters,
    isLoading: isLoadingFilters || isCreating || isUpdating || isDeleting,
    createFilter,
    updateFilter,
    deleteFilter,
  };
}
