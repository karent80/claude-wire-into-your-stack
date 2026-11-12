---
name: docline
description: Add a one-line JSDoc comment (docline) above every new function. Use whenever you write or add a function, handler, or helper in this codebase, or when asked to document new functions.
---

# Docline

Every new function gets a one-line JSDoc comment directly above it.

## Format

```js
/** Returns the user with the given id, or undefined if none exists. */
function getUser(id) { ... }
```

## Rules

- Use a single-line `/** ... */` comment, placed immediately above the function.
- Start with a verb in the third person (Returns, Creates, Validates, Deletes).
- Say what the function does, not how. Keep it under about 100 characters.
- Cover every kind of function: declarations, arrow functions assigned to a `const`, route handlers defined as named functions, and exported helpers.
- Skip tiny inline callbacks (e.g. `.map(x => x.id)`) and anonymous route callbacks passed directly to `router.get(...)`.
- Only document functions you add or substantially rewrite. Don't touch existing functions unless asked.
- Don't add `@param` or `@returns` tags unless the user asks for full docs.

## Steps

1. After writing code, scan the diff (`git diff`) for new functions.
2. Add a docline above each one that lacks it.
3. Run `npm run lint` to confirm nothing broke.
