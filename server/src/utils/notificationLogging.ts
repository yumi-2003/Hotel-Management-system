export const getRecipientLogValue = (recipient: unknown): string => {
  if (recipient === null || recipient === undefined) {
    return 'unknown';
  }

  if (typeof recipient === 'string' || typeof recipient === 'number' || typeof recipient === 'boolean') {
    return String(recipient);
  }

  if (typeof recipient === 'object') {
    const value = recipient as { _id?: unknown; id?: unknown };
    if (value._id !== undefined && value._id !== null) {
      return String(value._id);
    }
    if (value.id !== undefined && value.id !== null) {
      return String(value.id);
    }
  }

  return 'unknown';
};

export const getNotificationLogId = (notification: unknown): string => {
  if (notification && typeof notification === 'object') {
    const value = notification as { _id?: unknown; id?: unknown };
    if (value._id !== undefined && value._id !== null) {
      return String(value._id);
    }
    if (value.id !== undefined && value.id !== null) {
      return String(value.id);
    }
  }

  return 'unknown';
};
