"use client";

import { useEffect, useState } from "react";
import styles from "./stats.module.css";

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load statistics.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>Loading statistics…</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>CineFan</span> Platform Stats
        </h1>
        <p className={styles.subtitle}>A live snapshot of community activity</p>
      </header>

      {/* ── Stat Cards ── */}
      <section className={styles.cardGrid}>
        <StatCard label="Total Users" value={stats.totalUsers} icon="👤" color="var(--c-blue)" />
        <StatCard label="Total Posts" value={stats.totalPosts} icon="📝" color="var(--c-purple)" />
        <StatCard label="Total Comments" value={stats.totalComments} icon="💬" color="var(--c-teal)" />
        <StatCard label="Total Likes" value={stats.totalLikes} icon="❤️" color="var(--c-red)" />
        <StatCard label="Avg Posts / User" value={stats.avgPostsPerUser} icon="📊" color="var(--c-orange)" />
      </section>

      {/* ── Most Active User ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🏆 Most Active User</h2>
        {stats.mostActiveUser ? (
          <div className={styles.highlightCard}>
            <div className={styles.highlightAvatar}>
              {(stats.mostActiveUser.name || stats.mostActiveUser.username || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className={styles.highlightName}>
                {stats.mostActiveUser.name || stats.mostActiveUser.username}
              </p>
              <p className={styles.highlightSub}>
                @{stats.mostActiveUser.username} ·{" "}
                <strong>{stats.mostActiveUser._count?.posts ?? 0}</strong> posts
              </p>
            </div>
          </div>
        ) : (
          <p className={styles.empty}>No data available.</p>
        )}
      </section>

      {/* ── Most Liked Post ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🔥 Most Liked Post</h2>
        {stats.mostLikedPost ? (
          <div className={styles.postCard}>
            <p className={styles.postContent}>"{stats.mostLikedPost.content}"</p>
            <div className={styles.postMeta}>
              <span>by @{stats.mostLikedPost.author?.username}</span>
              <span>❤️ {stats.mostLikedPost._count?.likes ?? 0} likes</span>
              <span>💬 {stats.mostLikedPost._count?.comments ?? 0} comments</span>
            </div>
          </div>
        ) : (
          <p className={styles.empty}>No data available.</p>
        )}
      </section>

      {/* ── Top Followed Users ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>⭐ Top 5 Most Followed Users</h2>
        {stats.topFollowedUsers?.length > 0 ? (
          <ol className={styles.rankList}>
            {stats.topFollowedUsers.map((user, i) => (
              <li key={user.id} className={styles.rankItem}>
                <span className={styles.rankNum}>#{i + 1}</span>
                <span className={styles.rankAvatar}>
                  {(user.name || user.username || "?")[0].toUpperCase()}
                </span>
                <span className={styles.rankName}>
                  {user.name || user.username}{" "}
                  <span className={styles.rankHandle}>@{user.username}</span>
                </span>
                <span className={styles.rankCount}>
                  {user._count?.followers ?? 0} followers
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>No data available.</p>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={styles.card} style={{ "--card-accent": color }}>
      <span className={styles.cardIcon}>{icon}</span>
      <span className={styles.cardValue}>{value}</span>
      <span className={styles.cardLabel}>{label}</span>
    </div>
  );
}