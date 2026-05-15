"use client";

import { useEffect } from "react";
import { useRefreshTokenMutation, useGetCsrfTokenQuery } from "@/store/api/authApi";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

/**
 * SessionManager handles proactive token refreshing in the background.
 * It ensures the access token is refreshed before it expires (every 50 minutes for a 60-minute token).
 */
export default function SessionManager() {
  const [refreshToken] = useRefreshTokenMutation();
  const { data: csrfData, refetch: refetchCsrf } = useGetCsrfTokenQuery();

  // Handle CSRF token storage and periodic refetch
  useEffect(() => {
    if (csrfData?.csrfToken) {
      Cookies.set("csrf_token", csrfData.csrfToken, { sameSite: "strict" });
    }

    // Refresh CSRF token every 30 minutes
    const CSRF_REFRESH_INTERVAL = 30 * 60 * 1000;
    const intervalId = setInterval(() => {
      refetchCsrf();
    }, CSRF_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [csrfData, refetchCsrf]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const scheduleRefresh = () => {
      const token = Cookies.get("flwbite_token");
      if (!token) return;

      try {
        // Decode JWT payload to get 'exp'
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        
        // Refresh 3 minutes before expiration
        const REFRESH_BUFFER = 3 * 60 * 1000; 
        const delay = exp - now - REFRESH_BUFFER;

        // If delay is positive, schedule it. If negative (already within 3 min), refresh immediately.
        timeoutId = setTimeout(async () => {
          try {
            await refreshToken(undefined).unwrap();
            // scheduleRefresh will be called again by the 15m interval or by this effect re-running
          } catch (err) {
            // Proactive refresh failed
            // Retry in 30 seconds if failed
            timeoutId = setTimeout(scheduleRefresh, 30000);
          }
        }, Math.max(delay, 0));

      } catch (err) {
        // Failed to parse token
      }
    };

    // 1. Proactive Refresh (3 min before expiry)
    scheduleRefresh();

    // 2. Periodic Refresh (Every 15 minutes as heartbeat)
    const HEARTBEAT_INTERVAL = 15 * 60 * 1000;
    intervalId = setInterval(async () => {
      const token = Cookies.get("flwbite_token");
      if (!token) return;
      
      try {
        await refreshToken(undefined).unwrap();
      } catch (err) {
        // Heartbeat refresh failed
      }
    }, HEARTBEAT_INTERVAL);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshToken]);

  return null;
}
