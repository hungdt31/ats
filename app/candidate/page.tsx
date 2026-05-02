"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMe } from "@/hooks/use-me";
import {
  useCandidateApplications,
  useCandidateProfile,
  useUpdateCandidateProfile,
  useCandidateInterviews,
} from "@/hooks/use-candidate";

import { CandidateApplications } from "@/components/candidate/applications";
import { CandidateInterviews } from "@/components/candidate/interviews";
import { CandidateProfile } from "@/components/candidate/profile";

export default function CandidateDashboardPage() {
  const { data: user } = useMe();
  const { data: applications, isLoading: isAppsLoading } = useCandidateApplications();
  const { data: profileData, isLoading: isProfileLoading } = useCandidateProfile();
  const { data: interviews, isLoading: isInterviewsLoading } = useCandidateInterviews();
  const updateProfileMutation = useUpdateCandidateProfile();

  return (
    <div className="min-h-svh flex flex-col bg-muted/30">
      <SiteHeader user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Không gian ứng viên</h1>
          <p className="mt-2 text-muted-foreground">
            Quản lý đơn ứng tuyển, theo dõi lịch phỏng vấn và cập nhật hồ sơ cá nhân của bạn.
          </p>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="applications">Đơn ứng tuyển ({applications?.length || 0})</TabsTrigger>
            <TabsTrigger value="interviews">Lịch phỏng vấn ({interviews?.length || 0})</TabsTrigger>
            <TabsTrigger value="profile">Hồ sơ cá nhân</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <CandidateApplications applications={applications} isLoading={isAppsLoading} />
          </TabsContent>

          <TabsContent value="interviews" className="space-y-4">
            <CandidateInterviews interviews={interviews} isLoading={isInterviewsLoading} />
          </TabsContent>

          <TabsContent value="profile">
            <CandidateProfile
              profileData={profileData}
              isLoading={isProfileLoading}
              updateProfileMutation={updateProfileMutation}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
