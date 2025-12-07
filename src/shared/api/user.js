// src/shared/api/user.js
import { apiFetch } from "./http";

export function getCurrentUser() {
  return apiFetch("/users/me");
}

export function updateUser(data) {
  return apiFetch("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
