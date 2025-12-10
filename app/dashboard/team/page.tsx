import { createServerClient } from '@/lib/supabase/server';
import { getWorkspaceMembers, getWorkspaceInvites } from '@/lib/supabase/queries';
import { WorkspaceMember, WorkspaceInvite } from '@/lib/types/database';
import TeamMembersList from '@/app/components/team/TeamMembersList';
import InviteMemberForm from '@/app/components/team/InviteMemberForm';

/**
 * Team Management Page - Server Component
 * Displays workspace members and invite management
 */

async function TeamPageContent() {
  try {
    // Get current user
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get user's workspace
    const { data: workspaceData, error: workspaceError } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (workspaceError || !workspaceData) {
      throw new Error('No workspace found');
    }

    const workspaceId = workspaceData.workspace_id;
    const userRole = workspaceData.role as string;

    // Load members and invites
    const [members, invites] = await Promise.all([
      getWorkspaceMembers(workspaceId),
      getWorkspaceInvites(workspaceId),
    ]);

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-card-border">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
            <p className="text-muted">Manage your workspace members and invitations</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Invite Member Section */}
          {(userRole === 'owner' || userRole === 'admin') && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Invite Member</h2>
              <InviteMemberForm
                workspaceId={workspaceId}
                userRole={userRole}
              />
            </div>
          )}

          {/* Members Section */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Team Members ({members.length})
            </h2>
            <TeamMembersList
              members={members}
              currentUserId={user.id}
              userRole={userRole}
              workspaceId={workspaceId}
            />
          </div>

          {/* Pending Invites Section */}
          {invites && invites.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Pending Invitations ({invites.length})
              </h2>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-card-border border-b border-card-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted">Invited</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted">Expires</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {invites.map((invite: any) => {
                      const isExpired = new Date(invite.expires_at) < new Date();
                      return (
                        <tr key={invite.id} className="hover:bg-card-hover transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            {invite.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted">
                            <span className="capitalize">{invite.role}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted">
                            {new Date(invite.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isExpired ? (
                              <span className="text-red-600">Expired</span>
                            ) : (
                              new Date(invite.expires_at).toLocaleDateString()
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {(userRole === 'owner' || userRole === 'admin') && !isExpired && (
                              <button
                                onClick={() => {
                                  // Copy invite link
                                  const inviteUrl = `${window.location.origin}/auth/signup?invite=${invite.token}`;
                                  navigator.clipboard.writeText(inviteUrl);
                                  alert('Invite link copied to clipboard');
                                }}
                                className="text-blue-600 hover:text-blue-800 underline text-xs font-medium"
                              >
                                Copy Link
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('[team] Error loading team page:', error);
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-card-border">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
            <p className="text-muted">Manage your workspace members and invitations</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="card p-6 bg-red-50 border border-red-200">
            <p className="text-red-800">Failed to load team management. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default function TeamPage() {
  return <TeamPageContent />;
}
