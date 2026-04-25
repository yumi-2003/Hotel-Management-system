import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "../../lib/utils";

export const StatsCardSkeleton = () => (
  <Card className="rounded-3xl shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <Skeleton className="h-4 w-28 max-w-[70%]" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-9 w-24 mb-2 max-w-[65%]" />
      <Skeleton className="h-3.5 w-full max-w-[85%]" />
    </CardContent>
  </Card>
);

export const ChartSkeleton = ({
  height = "h-[400px]",
}: {
  height?: string;
}) => (
  <Card className={cn("rounded-[32px] shadow-sm", height)}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-48 max-w-[60%]" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-full w-full rounded-2xl" />
    </CardContent>
  </Card>
);

const DashboardHeaderSkeleton = ({
  compact = false,
  actions = 2,
}: {
  compact?: boolean;
  actions?: number;
}) => (
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
    <div className="space-y-2 w-full max-w-xl">
      <Skeleton className={cn(compact ? "h-9 w-56" : "h-11 w-72", "max-w-[90%]")} />
      <Skeleton className="h-5 w-full max-w-md" />
    </div>
    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
      {[...Array(actions)].map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-11 rounded-xl",
            i === 0 ? "w-40" : "w-32",
          )}
        />
      ))}
    </div>
  </div>
);

const PaymentTableSkeleton = () => (
  <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
    <div className="p-6 border-b border-border flex justify-between items-center gap-4">
      <Skeleton className="h-6 w-56 max-w-[60%]" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="divide-y divide-border/50">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4 px-6 py-4 items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-5 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

const QuickLinksSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm">
    <Skeleton className="h-7 w-52 mb-6" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-muted border border-border space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-full max-w-[85%]" />
        </div>
      ))}
    </div>
  </div>
);

const ArrivalDepartureCardSkeleton = ({
  rows = 4,
  showFooter = false,
}: {
  rows?: number;
  showFooter?: boolean;
}) => (
  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
    <Skeleton className="h-7 w-40 mb-6" />
    <div className="space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-36 max-w-[80%]" />
            <Skeleton className="h-3 w-40 max-w-[90%]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    {showFooter && (
      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
      </div>
    )}
  </div>
);

const ReceptionistPanelSkeleton = () => (
  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
    <Skeleton className="h-7 w-44 mb-6" />
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-muted border border-border space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    <Skeleton className="h-4 w-32 mt-4 mx-auto" />
  </div>
);

const ReceptionistDepartureGridSkeleton = () => (
  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
    <Skeleton className="h-7 w-44 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HousekeepingWorkCenterSkeleton = () => (
  <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-11 w-40 rounded-xl" />
    </div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 rounded-3xl border border-border bg-muted/20 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48 max-w-[90%]" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
            <Skeleton className="h-11 w-28 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HousekeepingSidePanelSkeleton = () => (
  <div className="space-y-8">
    <div className="bg-[#0F2F2F] rounded-[2rem] p-8 relative overflow-hidden">
      <Skeleton className="h-4 w-32 mb-3 bg-white/15" />
      <Skeleton className="h-7 w-full max-w-[90%] bg-white/15 mb-2" />
      <Skeleton className="h-7 w-full max-w-[80%] bg-white/15" />
    </div>
    <ChartSkeleton height="h-[340px]" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    <DashboardHeaderSkeleton actions={3} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <PaymentTableSkeleton />
      </div>
      <ChartSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartSkeleton height="h-[380px]" />
      <ChartSkeleton height="h-[380px]" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartSkeleton height="h-[360px]" />
      <QuickLinksSkeleton />
    </div>
  </div>
);

export const ManagerDashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    <DashboardHeaderSkeleton compact actions={3} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <ChartSkeleton height="h-[400px]" />
      </div>
      <ChartSkeleton height="h-[400px]" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ArrivalDepartureCardSkeleton rows={4} showFooter />
      <ArrivalDepartureCardSkeleton rows={4} />
    </div>
    <QuickLinksSkeleton count={6} />
  </div>
);

export const ReceptionistDashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    <DashboardHeaderSkeleton compact actions={1} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ReceptionistPanelSkeleton />
      <ChartSkeleton height="h-[420px]" />
    </div>
    <ReceptionistDepartureGridSkeleton />
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-52" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-border">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const HousekeepingDashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    <DashboardHeaderSkeleton compact actions={1} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
    <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-[2rem] flex items-center justify-between gap-6">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="w-12 h-12 rounded-2xl bg-blue-500/20" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-5 w-64 bg-blue-500/20" />
          <Skeleton className="h-4 w-56 bg-blue-500/20" />
        </div>
      </div>
      <Skeleton className="h-11 w-28 rounded-2xl bg-blue-500/20" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <HousekeepingWorkCenterSkeleton />
      <HousekeepingSidePanelSkeleton />
    </div>
  </div>
);

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

export const RoomTypeGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="h-40 bg-muted relative overflow-hidden">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3 gap-3">
            <Skeleton className="h-6 w-1/2" />
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-18 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </>
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
