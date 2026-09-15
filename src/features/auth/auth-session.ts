export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthService {
  register(email: string, password: string): Promise<AuthUser>;
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
  getCurrentUser(): AuthUser | null;
  subscribe(
    callback: (user: AuthUser | null) => void,
  ): () => void;
}
