# Class 2 — Introduction to Express

## Topics Covered
- Why Express is used instead of the raw `http` module
- Setting up an Express app
- Middleware — what it is, and `express.json()` specifically
- Building **REST API** routes: GET (all + by id), POST
- HTTP status codes (`404`, and which codes *should* be used)
- Route parameters (`req.params`) vs the request body (`req.body`)
- What was intentionally left incomplete (PUT/PATCH, DELETE) for future classes

---

## 1. Why Express? (Picking Up From Class 1)

In [Class 1](../class-1(Intro%20to%20Node)/NOTES.md) we built a server with raw `http.createServer` and manually parsed `req.url` with a `switch` statement. That approach doesn't scale: no clean way to separate GET from POST on the same path, no automatic 404s, no easy way to read a JSON body, and every route is hand-wired.

**Express** is a minimal web framework built on top of Node's `http` module that solves exactly these pain points.

```js
const express = require("express");
const app = express();
```

- `express()` creates an **application instance** — this single `app` object replaces the manual `http.createServer` + `switch(req.url)` pattern entirely.
- Express handles routing, request parsing helpers, and response helpers (`res.send`, `res.json`, `res.status`) out of the box.

> **Analogy — Hiring a Professional Receptionist:** Class 1's raw `http` server was a hotel with one overworked receptionist reading from a handwritten instruction sheet. Express is like installing a **professional front-desk system**: it already knows how to read a guest's request card (`req`), match it to the right department by method + path (`GET /courses` vs `POST /courses` are different "departments" even though the path is the same), and hand back a properly formatted response — you just plug in what each department *does*.

---

## 2. Middleware — The Security Checkpoint

Middleware is a function that runs **in between** the request arriving and your route handler actually processing it. Every request passes through registered middleware, in order, before reaching its final route.

```js
app.use(express.json());
```

`express.json()` is Express's built-in middleware that reads the raw JSON text sent in a request body and parses it into a real JavaScript object, available at `req.body`. **Without this middleware, `req.body` would be `undefined`** — Express does not parse bodies by default.

> **Analogy — Airport Security Checkpoint:** Every passenger (`req`) walks through security (middleware) before reaching their gate (the route handler). `express.json()` is like a translator at that checkpoint: it takes a passenger's foreign-language paperwork (raw JSON text over the wire) and translates it into a form your gate agent (route handler) can actually read (`req.body` as a JS object). If you skip this checkpoint, the gate agent receives gibberish they can't process.

Middleware **must be registered before** the routes that depend on it — order matters, top to bottom, exactly like a security line you must pass before reaching your gate.

---

## 3. In-Memory Data (Standing in for a Database — Until Class 3)

Instead of a real database, data lives directly in a JS array for demo purposes:

```js
const courses = [
  { id: 1, courseName: "Java", instructor: "Priyansh" },
  { id: 2, courseName: "Python", instructor: "Aadrita" },
  { id: 3, courseName: "DBMS", instructor: "Vinayak" },
];
```
This array resets every time the server restarts (`nodemon` restarting on a file save wipes any course you `POST`ed) — a real database (Class 3: MongoDB) is what makes data *persistent*.

---

## 4. Reading Resources — `GET`

### 4.1 Get all courses
```js
app.get("/courses", (req, res) => {
  res.send(courses);
});
```
- `app.get(path, handler)` registers a route that only responds to `GET` requests hitting `/courses`.
- `res.send(...)` sends data back to the client — Express automatically serializes a JS array/object into JSON and sets the right `Content-Type` header for you (no manual `JSON.stringify` needed, unlike raw `http`).

### 4.2 Get a single course by ID — Route Parameters
```js
app.get("/courses/:id", (req, res) => {
  let course = courses.find((course) => course.id === parseInt(req.params.id));
  if (!course) res.status(404).send('The Course Does not exist');

  res.send(course);
});
```
- `:id` in the path is a **route parameter** — a placeholder segment. A request to `/courses/2` makes Express capture `"2"` and expose it as `req.params.id`. Route params always arrive as **strings**, which is why `parseInt(req.params.id)` is needed before comparing to a numeric `id`.
- `res.status(404).send(...)` demonstrates sending a custom HTTP status code when a resource isn't found — `404` conventionally means "Not Found."

> **Analogy — Apartment Mailboxes:** `/courses/:id` is like a block of numbered mailboxes. `req.params.id` is you reading the number off the specific mailbox someone asked for (`/courses/2` → mailbox #2). This is different from `req.body`, which is more like a sealed envelope's *contents* handed over separately — the mailbox number tells you *which* box, the envelope tells you *what's inside*.

> ⚠️ **Learning note — a real bug in this code:** The handler calls `res.send()` **twice** in the not-found case: once for the `404` (`res.status(404).send('The Course Does not exist')`), and then unconditionally again with `res.send(course)`, where `course` is `undefined`. In Express, calling `res.send()`/`res.end()` more than once on the same response throws an error (`ERR_HTTP_HEADERS_SENT`) because the response has already been closed. **The fix** is to `return` immediately after the 404 response:
> ```js
> app.get("/courses/:id", (req, res) => {
>   let course = courses.find((course) => course.id === parseInt(req.params.id));
>   if (!course) {
>     return res.status(404).send('The Course Does not exist');
>   }
>   res.send(course);
> });
> ```

---

## 5. Creating Resources — `POST`

```js
app.post('/courses', (req, res) => {
    courses.push(req.body);
    res.send('Course Created');
    // We have to improve this
});
```
- `app.post(path, handler)` handles `POST` requests — the conventional HTTP method for **creating** a new resource.
- `req.body` contains the JSON payload the client sent (e.g. `{ "id": 4, "courseName": "DevOps", "instructor": "Riya" }`), parsed thanks to the `express.json()` middleware registered earlier.
- The `// We have to improve this` comment is an honest flag that this is a naive implementation: no validation that required fields exist, no auto-generated unique `id` (a client could send a duplicate or no `id` at all), and no confirmation of what was actually created in the response.

> **Analogy — Library Card Catalog (REST/CRUD mental model):**
> - **GET** = look up a book (or all books) — read-only, nothing changes.
> - **POST** = hand the librarian a brand-new book to add to the shelf.
> - **PUT/PATCH** = correct details on a book already on the shelf (fix a typo in its title).
> - **DELETE** = pull a book off the shelf and remove its card entirely.
>
> Notice `POST /courses` doesn't say *which* book to update — it always creates something new. That's the core distinction from PUT/PATCH.

---

## 6. Planned but Not Yet Implemented

The file explicitly outlines the remaining REST operations as comments, to be covered later:
```js
// update a resource - http method - put , patch
// delete a resource - http method - delete
```

This maps to the standard REST/CRUD convention:
| Operation | HTTP Method | Status in this class |
|---|---|---|
| Create | POST | ✅ Implemented |
| Read (all) | GET | ✅ Implemented |
| Read (one) | GET `/:id` | ✅ Implemented (with a bug — see §4.2) |
| Update | PUT / PATCH | ⏳ Not yet (see Class 4) |
| Delete | DELETE | ⏳ Not yet |

---

## Dependencies ([package.json](server/package.json))
```json
"dependencies": {
  "express": "^5.2.1",
  "nodemon": "^3.1.14"
}
```
- **express** — the web framework itself.
- **nodemon** — a dev tool that watches your files and auto-restarts the server on every save, so you don't have to `Ctrl+C` and re-run `node index.js` manually. Used only during development, never in production.

---

## Files in this folder
| File | Purpose |
|---|---|
| [server/index.js](server/index.js) | Express app with GET/POST routes for `courses`, running on port 8004 |
| [server/package.json](server/package.json) | Project dependencies |

## Key Takeaways
- Express drastically simplifies routing compared to the raw `http` module from Class 1 — no manual `switch` on `req.url`, and GET/POST on the *same* path are handled separately and cleanly.
- `app.get`, `app.post`, etc. map directly to HTTP methods and REST conventions.
- `req.params` → data captured from the **URL path** (`:id`); `req.body` → data sent in the **request payload** (needs `express.json()` middleware to be readable).
- Middleware (`express.json()`) must be registered **before** routes that depend on it — Express processes things top-to-bottom.
- Calling `res.send()`/`res.status().send()` more than once for the same request is a bug — always `return` after sending an early response.

---

## Practice Questions

1. **Bug fix:** Explain, in your own words, *why* the current `/courses/:id` handler is broken when the course isn't found, and rewrite it correctly using an early `return`.

2. **Middleware:** What would `req.body` be inside the `POST /courses` handler if the line `app.use(express.json())` were deleted? Why?

3. **Route params vs body:** For a request `PUT /courses/2` with JSON body `{ "instructor": "Meera" }`, what would `req.params.id` be, and what would `req.body` be?

4. **Implement:** Add a `DELETE /courses/:id` route that removes the matching course from the `courses` array (hint: `Array.prototype.filter`). Send a `404` if no course with that id exists.

5. **Status codes:** The `POST /courses` handler currently responds with the default status `200 OK`. According to REST conventions, which status code *should* a successful resource-creation endpoint return, and how would you set it in Express?

6. **Design:** The `POST /courses` handler has no validation. Write the extra checks you'd add so that a request missing `courseName` or `instructor` gets rejected with a `400 Bad Request` and a helpful error message, instead of being pushed into the array as-is.
