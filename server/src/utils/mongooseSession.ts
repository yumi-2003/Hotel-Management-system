import mongoose from 'mongoose';

export type SessionLike = {
  startTransaction: () => void;
  commitTransaction: () => Promise<void> | void;
  abortTransaction: () => Promise<void> | void;
  endSession: () => void;
  isNoop?: boolean;
};

const createNoopSession = (): SessionLike => ({
  startTransaction: () => {},
  commitTransaction: async () => {},
  abortTransaction: async () => {},
  endSession: () => {},
  isNoop: true,
});

export const getSafeSession = async (): Promise<any> => {
  try {
    const session = await mongoose.startSession();

    if (!session) {
      return createNoopSession();
    }

    return session;
  } catch {
    return createNoopSession();
  }
};

export const bindSession = <T>(query: T, session: any): T => {
  if (session?.isNoop) {
    return query;
  }

  if (query && typeof (query as any).session === 'function') {
    return (query as any).session(session);
  }

  return query;
};

export const getSessionOptions = (session: any) => {
  if (session?.isNoop) {
    return {};
  }
  return { session };
};
