export const Validation = {
  email(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address';
    return null;
  },

  password(value: string): string | null {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain a number';
    return null;
  },

  displayName(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return 'Display name is required';
    if (trimmed.length < 2) return 'Name must be at least 2 characters';
    if (trimmed.length > 50) return 'Name must be 50 characters or less';
    if (!/^[\w\s'-]+$/.test(trimmed)) return 'Name contains invalid characters';
    return null;
  },

  listName(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return 'List name is required';
    if (trimmed.length > 80) return 'List name must be 80 characters or less';
    return null;
  },

  itemName(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return 'Item name is required';
    if (trimmed.length > 120) return 'Item name must be 120 characters or less';
    return null;
  },

  quantity(value: number): string | null {
    if (!Number.isFinite(value) || value <= 0) return 'Quantity must be greater than zero';
    if (value > 999) return 'Quantity must be 999 or less';
    return null;
  },

  searchQuery(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed.length > 0 && trimmed.length < 2) return 'Search must be at least 2 characters';
    if (trimmed.length > 100) return 'Search query is too long';
    return null;
  },

  sanitizeText(value: string): string {
    return value
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },
};

export function validateForm(errors: Record<string, string | null>): boolean {
  return Object.values(errors).every((e) => e === null);
}
