import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, Mail, CheckCircle2, AlertCircle, 
  Trash2, RefreshCw, Copy, ExternalLink, Activity, Clock, Key, Eye, Edit3, 
  ChevronRight, Building, Plus, Search, Filter, Lock
} from 'lucide-react';
import { Workspace, WorkspaceMember, WorkspaceRole } from '../types';

interface TeamManagementProps {
  currentWorkspace: Workspace | null;
  allWorkspaces: Workspace[];
  onSwitchWorkspace: (wsId: string) => void;
  onCreateWorkspace: (name: string) => Promise<void>;
  authFetch?: (url: string, options?: RequestInit) => Promise<Response>;
  token?: string;
  addToast: (type: any, title: string, message?: string) => void;
  currentUser?: any;
  user?: any;
}

interface ActivityLogItem {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  details: any;
  timestamp: string;
  ip: string;
}

interface InvitationItem {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  createdAt: string;
  expiresAt: string;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  currentWorkspace,
  allWorkspaces = [],
  onSwitchWorkspace,
  onCreateWorkspace,
  authFetch,
  token,
  addToast,
  currentUser,
  user
}) => {
  const activeUser = currentUser || user || {};

  const effectiveAuthFetch = authFetch || (async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!headers.has('Authorization') && activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }
    return fetch(url, { ...options, headers });
  });

  const [activeSubTab, setActiveSubTab] = useState<'members' | 'invitations' | 'activity' | 'roles_matrix'>('members');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor');
  const [inviting, setInviting] = useState<boolean>(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string>('');

  // Create Workspace Modal State
  const [showCreateWsModal, setShowCreateWsModal] = useState<boolean>(false);
  const [newWsName, setNewWsName] = useState<string>('');
  const [creatingWs, setCreatingWs] = useState<boolean>(false);

  // Member Role Change Modal State
  const [editingMember, setEditingMember] = useState<WorkspaceMember | null>(null);
  const [newRoleForMember, setNewRoleForMember] = useState<WorkspaceRole>('editor');
  const [updatingRole, setUpdatingRole] = useState<boolean>(false);

  // Member Removal State
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const [removingMember, setRemovingMember] = useState<boolean>(false);

  // User's role in current workspace
  const userMemberRecord = currentWorkspace?.members?.find(
    m => m && ((activeUser?.id && m.userId === activeUser.id) || (activeUser?.email && m.email?.toLowerCase() === activeUser.email?.toLowerCase()))
  );
  const currentUserRole: WorkspaceRole = (activeUser?.id && currentWorkspace?.ownerId === activeUser.id) 
    ? 'owner' 
    : (userMemberRecord?.role || (activeUser?.role === 'admin' ? 'owner' : 'viewer'));

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  // Load team details & activity logs on workspace change
  useEffect(() => {
    if (currentWorkspace?.id) {
      loadTeamData();
    }
  }, [currentWorkspace?.id]);

  const loadTeamData = async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      // 1. Fetch Members & Invitations
      const memRes = await effectiveAuthFetch(`/api/workspaces/${currentWorkspace.id}/members`);
      if (memRes.ok) {
        const data = await memRes.json();
        setMembers(data.members || []);
        setInvitations(data.invitations || []);
      }

      // 2. Fetch Activity Logs
      const logRes = await effectiveAuthFetch(`/api/workspaces/${currentWorkspace.id}/activity-logs`);
      if (logRes.ok) {
        const logs = await logRes.json();
        setActivityLogs(logs || []);
      }
    } catch (e: any) {
      addToast('error', 'Load Error', e.message || 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  // Send Email Invite
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !currentWorkspace?.id) return;
    setInviting(true);
    try {
      const res = await effectiveAuthFetch(`/api/workspaces/${currentWorkspace.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedInviteLink(data.inviteLink);
        addToast('success', 'Invitation Sent', `Invitation created for ${inviteEmail} as ${inviteRole.toUpperCase()}`);
        loadTeamData();
      } else {
        addToast('error', 'Invite Failed', data.error || 'Could not send invitation');
      }
    } catch (err: any) {
      addToast('error', 'Invite Failed', err.message || 'Error creating invitation');
    } finally {
      setInviting(false);
    }
  };

  // Update Member Role
  const handleUpdateRole = async () => {
    if (!editingMember || !currentWorkspace?.id) return;
    setUpdatingRole(true);
    try {
      const res = await effectiveAuthFetch(`/api/workspaces/${currentWorkspace.id}/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRoleForMember })
      });

      if (res.ok) {
        addToast('success', 'Role Updated', `Updated ${editingMember.name}'s role to ${newRoleForMember.toUpperCase()}`);
        setEditingMember(null);
        loadTeamData();
      } else {
        const err = await res.json();
        addToast('error', 'Update Failed', err.error || 'Failed to update member role');
      }
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Error updating role');
    } finally {
      setUpdatingRole(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async () => {
    if (!memberToRemove || !currentWorkspace?.id) return;
    setRemovingMember(true);
    try {
      const res = await effectiveAuthFetch(`/api/workspaces/${currentWorkspace.id}/members/${memberToRemove.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        addToast('success', 'Member Removed', `Removed ${memberToRemove.name || memberToRemove.email} from workspace`);
        setMemberToRemove(null);
        loadTeamData();
      } else {
        const err = await res.json();
        addToast('error', 'Removal Failed', err.error || 'Failed to remove member');
      }
    } catch (err: any) {
      addToast('error', 'Removal Failed', err.message || 'Error removing member');
    } finally {
      setRemovingMember(false);
    }
  };

  // Handle Workspace Creation
  const handleCreateNewWs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreatingWs(true);
    try {
      await onCreateWorkspace(newWsName.trim());
      setShowCreateWsModal(false);
      setNewWsName('');
      addToast('success', 'Workspace Created', `Created workspace "${newWsName}"`);
    } catch (e: any) {
      addToast('error', 'Creation Failed', e.message || 'Failed to create workspace');
    } finally {
      setCreatingWs(false);
    }
  };

  // Filter members by search
  const filteredMembers = members.filter(m => 
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter activity logs by search
  const filteredLogs = activityLogs.filter(l =>
    (l.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    JSON.stringify(l.details || {}).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Owner</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Admin</span>;
      case 'editor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Editor</span>;
      case 'viewer':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Viewer</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Selector Bar & Summary Banner */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Building size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl text-slate-800 dark:text-white">
                  {currentWorkspace?.name || 'Workspace Team'}
                </h2>
                {getRoleBadge(currentUserRole)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Workspace ID: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">{currentWorkspace?.id}</code> &bull; Multi-Tenant Enterprise Tier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Workspace Switcher Selector */}
            {allWorkspaces.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Active Workspace:</span>
                <select
                  value={currentWorkspace?.id || ''}
                  onChange={(e) => onSwitchWorkspace(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {allWorkspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({activeUser?.id && w.ownerId === activeUser.id ? 'Owner' : 'Member'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowCreateWsModal(true)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus size={15} />
              <span>New Workspace</span>
            </button>

            {canManageTeam && (
              <button
                onClick={() => {
                  setGeneratedInviteLink('');
                  setInviteEmail('');
                  setShowInviteModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <UserPlus size={15} />
                <span>Invite Member</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs for Team Management */}
        <div className="flex items-center justify-between pt-4 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'members'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users size={15} />
              <span>Team Members ({members.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('invitations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'invitations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Mail size={15} />
              <span>Pending Invitations ({invitations.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('activity')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'activity'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Activity size={15} />
              <span>Member Activity Logs</span>
            </button>

            <button
              onClick={() => setActiveSubTab('roles_matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'roles_matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Shield size={15} />
              <span>Role Permissions Matrix</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search team or logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-200 w-48"
              />
            </div>
            <button
              onClick={loadTeamData}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: MEMBERS LIST */}
      {activeSubTab === 'members' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> Workspace Member Directory
            </h3>
            <span className="text-xs text-slate-400">
              Total Seats: {members.length} / {currentWorkspace?.limits?.maxMembers === -1 ? 'Unlimited' : (currentWorkspace?.limits?.maxMembers || 10)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-3">Member Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Workspace Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredMembers.map((m) => {
                  const isSelf = Boolean(activeUser?.id && (m.userId === activeUser.id || (activeUser?.email && m.email?.toLowerCase() === activeUser.email.toLowerCase())));
                  const isOwner = m.role === 'owner';
                  return (
                    <tr key={m.id || m.userId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                          {(m.name || m.email || 'U')[0]}
                        </div>
                        <div>
                          <span>{m.name || 'Team Member'}</span>
                          {isSelf && <span className="ml-1.5 text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold">YOU</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">{m.email}</td>
                      <td className="py-3.5 px-3">{getRoleBadge(m.role)}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {m.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : (m.invitedAt ? new Date(m.invitedAt).toLocaleDateString() : 'Active')}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageTeam && !isOwner && !isSelf && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMember(m);
                                  setNewRoleForMember(m.role);
                                }}
                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit3 size={13} />
                                <span>Change Role</span>
                              </button>

                              <button
                                onClick={() => setMemberToRemove(m)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                                title="Remove Member"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          {(isOwner || isSelf) && (
                            <span className="text-[11px] text-slate-400 italic font-normal">
                              {isOwner ? 'Workspace Primary Owner' : 'Self'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PENDING INVITATIONS */}
      {activeSubTab === 'invitations' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Mail size={18} className="text-amber-500" /> Pending Invitations ({invitations.length})
            </h3>
            {canManageTeam && (
              <button
                onClick={() => {
                  setGeneratedInviteLink('');
                  setInviteEmail('');
                  setShowInviteModal(true);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserPlus size={14} />
                <span>Send New Invite</span>
              </button>
            )}
          </div>

          {invitations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Mail size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">No pending invitations for this workspace.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Invite colleagues and team members by email to collaborate on chatbots, conversations, and knowledge bases.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-3 px-3">Invited Email</th>
                    <th className="py-3 px-3">Assigned Role</th>
                    <th className="py-3 px-3">Created Date</th>
                    <th className="py-3 px-3">Expires At</th>
                    <th className="py-3 px-3 text-right">Invitation Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {invitations.map((inv) => {
                    const inviteUrl = `${window.location.origin}?invite=${inv.token}`;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-100">{inv.email}</td>
                        <td className="py-3.5 px-3">{getRoleBadge(inv.role)}</td>
                        <td className="py-3.5 px-3 text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-3 text-slate-400">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(inviteUrl);
                              addToast('info', 'Link Copied', 'Invitation link copied to clipboard.');
                            }}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Copy size={13} />
                            <span>Copy Link</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: ACTIVITY LOGS */}
      {activeSubTab === 'activity' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" /> Member Activity & Security Audit Logs
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredLogs.length} events
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Activity size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">No activity logs recorded yet for this workspace.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Action Type</th>
                    <th className="py-3 px-3">Metadata / Details</th>
                    <th className="py-3 px-3 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-3 text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {log.userName || log.userId}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {JSON.stringify(log.details || {})}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400 font-mono">
                        {log.ip || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: ROLE PERMISSIONS REFERENCE MATRIX */}
      {activeSubTab === 'roles_matrix' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-500" /> Multi-Tenant Role Permission Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Role permissions strictly isolate workspace actions and enforce zero-trust multi-tenancy.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Capabilities / Permissions</th>
                  <th className="p-3 text-center">Owner</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Editor</th>
                  <th className="p-3 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {[
                  { label: 'View Workspace Data (Bots, Conversations, Knowledge)', owner: true, admin: true, editor: true, viewer: true },
                  { label: 'Create & Edit Chatbots & Embeds', owner: true, admin: true, editor: true, viewer: false },
                  { label: 'Upload RAG Knowledge Documents', owner: true, admin: true, editor: true, viewer: false },
                  { label: 'Configure AI Provider & Model Parameters', owner: true, admin: true, editor: true, viewer: false },
                  { label: 'Respond in Conversations Inbox', owner: true, admin: true, editor: true, viewer: false },
                  { label: 'Invite & Manage Team Members', owner: true, admin: true, editor: false, viewer: false },
                  { label: 'Change Member Roles & Access Levels', owner: true, admin: true, editor: false, viewer: false },
                  { label: 'View Invoices & Manage Subscriptions', owner: true, admin: false, editor: false, viewer: false },
                  { label: 'Delete Workspace & Primary Ownership', owner: true, admin: false, editor: false, viewer: false }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{row.label}</td>
                    <td className="p-3 text-center">{row.owner ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <Lock size={14} className="text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{row.admin ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <Lock size={14} className="text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{row.editor ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <Lock size={14} className="text-slate-300 mx-auto" />}</td>
                    <td className="p-3 text-center">{row.viewer ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <Lock size={14} className="text-slate-300 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: INVITE MEMBER */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <UserPlus size={18} className="text-blue-500" /> Invite Team Member
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {generatedInviteLink ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Invitation Created Successfully!</p>
                    <p className="mt-1 text-[11px]">Share the unique invitation link below with your team member to grant access.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Invitation URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedInviteLink);
                        addToast('info', 'Copied', 'Invitation link copied to clipboard');
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Modal
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold cursor-pointer"
                  >
                    <option value="admin">Admin (Full Team & Bot Management)</option>
                    <option value="editor">Editor (Create & Manage Bots, RAG Knowledge)</option>
                    <option value="viewer">Viewer (Read-Only Access)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Role Capabilities:</span>
                  <p className="mt-0.5">
                    {inviteRole === 'admin' && 'Admins can invite/remove members, manage bots, RAG, and AI settings.'}
                    {inviteRole === 'editor' && 'Editors can create/edit chatbots, knowledge base, and reply in inbox.'}
                    {inviteRole === 'viewer' && 'Viewers have read-only access and cannot modify data.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    {inviting && <RefreshCw size={13} className="animate-spin" />}
                    <span>{inviting ? 'Generating...' : 'Generate Invite Link'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE WORKSPACE */}
      {showCreateWsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Building size={18} className="text-blue-500" /> Create New Workspace
              </h3>
              <button
                onClick={() => setShowCreateWsModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewWs} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Legal Assistant Team"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-600 dark:text-blue-300">
                <p className="font-bold">14-Day Free Pro Trial Included</p>
                <p className="mt-0.5">Includes full multi-user workspace features, AI chatbots, knowledge base, and team seats.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateWsModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWs}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {creatingWs && <RefreshCw size={13} className="animate-spin" />}
                  <span>{creatingWs ? 'Creating...' : 'Create Workspace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT MEMBER ROLE */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-blue-500" /> Change Role for {editingMember.name || editingMember.email}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select New Role</label>
              <select
                value={newRoleForMember}
                onChange={(e) => setNewRoleForMember(e.target.value as WorkspaceRole)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold cursor-pointer"
              >
                <option value="admin">Admin (Manage team & all workspace assets)</option>
                <option value="editor">Editor (Create & edit chatbots/knowledge base)</option>
                <option value="viewer">Viewer (Read-only access)</option>
              </select>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={updatingRole}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {updatingRole && <RefreshCw size={13} className="animate-spin" />}
                  <span>{updatingRole ? 'Updating...' : 'Save Role'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REMOVE MEMBER CONFIRMATION */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-display font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle size={18} /> Remove Team Member
              </h3>
              <button
                onClick={() => setMemberToRemove(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{memberToRemove.name || memberToRemove.email}</strong> from workspace <strong className="text-slate-900 dark:text-white">{currentWorkspace?.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={removingMember}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {removingMember && <RefreshCw size={13} className="animate-spin" />}
                <span>{removingMember ? 'Removing...' : 'Remove Member'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
