import React from 'react';
import styles from './Analytics.module.css';

interface AnalyticsStats {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  totalTasks: number;
  completionRate: number;
  totalProjects: number;
  projectStats: Array<{
    name: string;
    total: number;
    done: number;
    rate: number;
  }>;
}

interface AnalyticsViewProps {
  stats: AnalyticsStats;
  loading: boolean;
}

/** Analytics presenter — memoized. Renders stats cards, bar charts, and table. */
export const AnalyticsView = React.memo(function AnalyticsView({
  stats,
  loading,
}: AnalyticsViewProps) {
  if (loading) {
    return <div className={styles.loading}>Loading analytics…</div>;
  }

  return (
    <div className={styles.analytics}>
      <h1>Analytics</h1>

      {/* Overview cards */}
      <div className={styles.overview}>
        <div className={styles.card}>
          <span className={styles.cardValue}>{stats.totalProjects}</span>
          <span className={styles.cardLabel}>Projects</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{stats.totalTasks}</span>
          <span className={styles.cardLabel}>Total Tasks</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{stats.completionRate}%</span>
          <span className={styles.cardLabel}>Completion Rate</span>
        </div>
      </div>

      {/* Charts row */}
      <div className={styles.chartsRow}>
        {/* Tasks by Status */}
        <div className={styles.chartCard}>
          <h3>Tasks by Status</h3>
          <div className={styles.barChart}>
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className={styles.barRow}>
                <span className={styles.barLabel}>{status}</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles[status] ?? ''}`}
                    style={{
                      width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className={styles.barValue}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className={styles.chartCard}>
          <h3>Tasks by Priority</h3>
          <div className={styles.barChart}>
            {Object.entries(stats.byPriority).map(([priority, count]) => (
              <div key={priority} className={styles.barRow}>
                <span className={styles.barLabel}>{priority}</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles[priority] ?? ''}`}
                    style={{
                      width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className={styles.barValue}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project completion table */}
      <div className={styles.chartCard}>
        <h3>Project Completion</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project</th>
              <th>Tasks</th>
              <th>Done</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>
            {stats.projectStats.map((ps) => (
              <tr key={ps.name}>
                <td>{ps.name}</td>
                <td>{ps.total}</td>
                <td>{ps.done}</td>
                <td>
                  <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${ps.rate}%` }}
                      />
                    </div>
                    <span className={styles.progressLabel}>{ps.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
