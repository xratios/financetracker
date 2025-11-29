import { init } from '@instantdb/react';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '94508c4b-4dfd-4f93-bf97-e7f0d362d5e2';

// Initialize InstantDB
// Note: Schema should be configured in the InstantDB dashboard
// The transactions entity should have: title, amount, type, category, date, createdAt, userId
export const db = init({ appId: APP_ID });

