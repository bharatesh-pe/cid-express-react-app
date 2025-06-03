import { useEffect, useRef } from 'react';
import { useAuth } from "../context/AuthContext";

const SessionTimeoutHandler = () => {
  const { logout } = useAuth();
  const timerRef = useRef(null);
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
//   const sessionTimeout = 1 * 60 * 1000; // 01 minutes in milliseconds

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
    }, sessionTimeout);
  };

  useEffect(() => {
    // List of events to consider as user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default SessionTimeoutHandler;
