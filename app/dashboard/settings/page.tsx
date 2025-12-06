"use client";

import dynamic from 'next/dynamic';
const CommentToDmAutomationSettings = dynamic(() => import('@/components/dashboard/CommentToDmAutomationSettings'), { ssr: false });

export default function Page() {
  const workspaceId = 'demo-workspace-id';
  return (
    <div className="space-y-8">
      <h1 className="text-2xl">Settings Page</h1>
      <CommentToDmAutomationSettings workspaceId={workspaceId} />
    </div>
  );
}
