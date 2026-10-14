import { RolUsuario, ProfileRow, AreaRow } from "./database";

export interface UserSessionProfile extends ProfileRow {
  area?: AreaRow | null;
}

export interface AuthState {
  user: UserSessionProfile | null;
  isLoading: boolean;
}
