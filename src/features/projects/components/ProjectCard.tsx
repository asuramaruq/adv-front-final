import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  isOwner: boolean;
  onDelete: (id: string) => void;
}

/** Individual project card — Presenter component (memoized). */
export const ProjectCard = React.memo(function ProjectCard({
  project,
  isOwner,
  onDelete,
}: ProjectCardProps) {
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete(project.id);
    },
    [onDelete, project.id],
  );

  return (
    <Link
      to={`/projects/${project.id}/board`}
      className={styles.card}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.name}>{project.name}</h3>
        {isOwner && (
          <button
            onClick={handleDelete}
            className={styles.deleteBtn}
            aria-label="Delete project"
          >
            🗑
          </button>
        )}
      </div>
      <p className={styles.description}>{project.description}</p>
      <div className={styles.meta}>
        <span className={styles.members}>
          👥 {project.members.length} member{project.members.length !== 1 ? 's' : ''}
        </span>
        <span className={styles.date}>
          {new Date(project.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
});
