import {
  isSessionFinished,
  transition,
} from '@/core/memorization/sessionEngine';
import { SessionState } from '@/core/types';
import { useReducer } from 'react';

export function useSession(sessionState: SessionState) {
  const [state, dispatch] = useReducer(transition, sessionState);
  const finished = isSessionFinished(state);
  return { state, dispatch, finished };
}
