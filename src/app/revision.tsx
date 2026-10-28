import React, { useState } from 'react';
import {
  ActiveRevisionSession,
  RevisionDashboard,
} from '@/components/revision';

/**
 * Revision Screen Component.
 * Acts as the top-level mode coordinator for the revision feature,
 * switching between the revision dashboard and the active recitation session.
 *
 * @returns {JSX.Element} Active revision session or revision dashboard
 */
export default function RevisionScreen() {
  const [inSession, setInSession] = useState<boolean>(false);

  if (inSession) {
    return (
      <ActiveRevisionSession onExitSession={() => setInSession(false)} />
    );
  }

  return (
    <RevisionDashboard onStartSession={() => setInSession(true)} />
  );
}
