const SESSION_KEY = "admin_session";

export function getAdminSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setAdminSession(sessionId: string): void {
  localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearAdminSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getAdminSession() !== null;
}

export async function verifySession(): Promise<boolean> {
  const session = getAdminSession();
  if (!session) return false;

  try {
    const response = await fetch("/api/admin/verify", {
      headers: {
        "X-Admin-Session": session,
      },
    });
    if (!response.ok) {
      clearAdminSession();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Login failed" };
    }

    setAdminSession(data.sessionId);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function logout(): Promise<void> {
  const session = getAdminSession();
  if (session) {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "X-Admin-Session": session,
        },
      });
    } catch {
    }
  }
  clearAdminSession();
}

export function getAuthHeaders(): Record<string, string> {
  const session = getAdminSession();
  if (session) {
    return { "X-Admin-Session": session };
  }
  return {};
}
