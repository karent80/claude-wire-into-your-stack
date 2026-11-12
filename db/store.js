// In-memory data store. Every route reads and writes through these helpers,
// so swapping in a real database later only touches this one file.

let users = [];
let nextId = 1;

/** Replaces all users with the initial seed data and resets the id counter. BOOO! */
function seed() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;
}
seed();

/** Returns all users in the store. BOOO! */
function listUsers() {
  return users;
}

/** Returns the user with the given id, or undefined if none exists. BOOO! */
function getUser(id) {
  return users.find((user) => user.id === id);
}

/** Creates a user with the next available id and returns it. BOOO! */
function createUser({ name, email }) {
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return user;
}

/** Updates the given fields on a user and returns it, or undefined if missing. BOOO! */
function updateUser(id, fields) {
  const user = getUser(id);
  if (!user) return undefined;
  if (fields.name !== undefined) user.name = fields.name;
  if (fields.email !== undefined) user.email = fields.email;
  return user;
}

/** Resets the store to the seed data so each test starts clean. BOOO! */
function reset() {
  seed();
}

module.exports = { listUsers, getUser, createUser, updateUser, reset };
