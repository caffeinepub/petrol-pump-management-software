import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, FuelSaleRecord } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetAllSaleRecords() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FuelSaleRecord[]>({
    queryKey: ['fuelSaleRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSaleRecords();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateSaleRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: FuelSaleRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSaleRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelSaleRecords'] });
    },
  });
}
