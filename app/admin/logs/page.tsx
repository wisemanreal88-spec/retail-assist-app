'use client';

import { useEffect, useState } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { SystemLog } from '@/lib/types/database';

/**
 * Admin System Logs Page
 * Display all system logs with filtering, search, and pagination
 */
export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ level: 'all', source: 'all', search: '' });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const supabase = await createServerSupabaseClient();
        let query = supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(100);

        if (filters.level !== 'all') {
          query = query.eq('level', filters.level);
        }
        if (filters.source !== 'all') {
          query = query.eq('source', filters.source);
        }

        const { data, error } = await query;
        if (!error && data) {
          let filtered = data as SystemLog[];
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter((log) => log.message?.toLowerCase().includes(searchLower));
          }
          setLogs(filtered);
        }
      } catch (e) {
        console.error('Failed to load logs:', e);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [filters]);

  const levelColors: Record<string, string> = {
    debug: 'bg-gray-100 text-gray-700',
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading logs...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">System Logs</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">Level</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="api">API</option>
              <option value="webhook">Webhook</option>
              <option value="background">Background</option>
              <option value="ui">UI</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-600 block mb-2">Search</label>
            <input
              type="text"
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No logs found matching your filters</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              className="bg-white border border-gray-200 rounded p-4 cursor-pointer hover:border-gray-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${levelColors[log.level] || levelColors.info}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{log.source}</span>
                    <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="font-semibold mt-2 text-gray-900">{log.message}</p>
                </div>
                <button className="text-gray-500 hover:text-gray-700 text-lg">{expandedLog === log.id ? '−' : '+'}</button>
              </div>

              {/* Expanded Details */}
              {expandedLog === log.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                  {log.workspace_id && (
                    <div>
                      <p className="text-gray-600">Workspace ID</p>
                      <p className="font-mono text-xs text-gray-800">{log.workspace_id}</p>
                    </div>
                  )}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div>
                      <p className="text-gray-600">Metadata</p>
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                  )}
                  {log.stack_trace && (
                    <div>
                      <p className="text-gray-600">Stack Trace</p>
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">{log.stack_trace}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
