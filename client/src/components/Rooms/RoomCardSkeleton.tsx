import { Skeleton } from "../ui/skeleton";

export const RoomCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <Skeleton className="h-64 w-full" />
      <div className="p-6 flex flex-col flex-1">
        <Skeleton className="h-7 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 mt-auto">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>

        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};

export const RoomListCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row h-full">
      <Skeleton className="h-64 md:h-auto md:w-1/3" />
      <div className="p-6 flex flex-col flex-1">
        <Skeleton className="h-7 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="mt-auto flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
};
