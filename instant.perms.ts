// InstantDB Permission Rules
// These rules enforce that users can only access their own transactions

export default {
  transactions: {
    allow: {
      view: 'auth.id == data.userId',
      create: 'auth.id == newData.userId',
      update: 'auth.id == data.userId',
      delete: 'auth.id == data.userId',
    },
  },
  $default: {
    allow: {
      $default: false,
    },
  },
};

