if (import.meta.env.VITE_CONTEXT != "ADMIN")
  throw new Error("Admin specific module imported in non-admin context");
