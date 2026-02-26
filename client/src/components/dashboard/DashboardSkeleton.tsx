import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "../../lib/utils";

export const StatsCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);

export const ChartSkeleton = () => (
  <Card className="h-[400px]">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-full w-full rounded-xl" />
    </CardContent>
  </Card>
);

export const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div>
          <ChartSkeleton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-8">
            <Skeleton className="h-7 w-48 mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between items-center p-4 rounded-xl border border-border">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
    <Card>
      <div className="p-0">
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            {[...Array(cols)].map((_, i) => (
              <Skeleton key={i} className={`h-8 ${i === cols - 1 ? 'w-24 ml-auto' : 'flex-1'}`} />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="p-4 flex gap-4 items-center">
              {[...Array(cols - 1)].map((_, j) => (
                <Skeleton key={j} className="h-12 flex-1 rounded-lg" />
              ))}
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

export const BadgeSkeleton = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-6 w-24 rounded-full", className)} />
);

export const GridCardSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </Card>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="p-8 space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </Card>
        <Card className="p-8 space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </Card>
      </div>
      <Card className="p-8 mb-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </Card>
      <div className="flex justify-end gap-4">
        <Skeleton className="h-16 w-32 rounded-2xl" />
        <Skeleton className="h-16 w-48 rounded-2xl" />
      </div>
    </div>
  </div>
);
