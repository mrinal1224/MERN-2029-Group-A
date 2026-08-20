# Class 2 — Introduction to Express

## Topics Covered
- Why Express is used instead of the raw `http` module
- Setting up an Express app
- Middleware — `express.json()`
- Building **REST API** routes: GET (all + by id), POST
- HTTP status codes (`404`)
- Route parameters (`req.params`)
- Request body (`req.body`)
- What was intentionally left incomplete (PUT/PATCH, DELETE) for future classes

---

## 1. Setting Up Express

```js
const express = require("express");
const app = express();
```

- `express()` creates an Express application instance — this replaces the manual `http.createServer` + `switch(req.url)` pattern from Class 1.
- Express handles routing, request parsing, and response helpers out of the box.

### Middleware: `express.json()`
```js
app.use(express.json());
```
This tells Express to automatically parse incoming JSON request bodies (e.g. from a POST request) into a JavaScript object available at `req.body`. Without this middleware, `req.body` would be `undefined`.

---

## 2. In-Memory Data

Instead of a database (that comes in Class 3), data is stored directly in an array for demo purposes:

```js
const courses = [
  { id: 1, courseName: "Java", instructor: "Priyansh" },
  { id: 2, courseName: "Python", instructor: "Aadrita" },
  { id: 3, courseName: "DBMS", instructor: "Vinayak" },
];
```

---

## 3. Reading Resources — `GET`

### Get all courses
```js
app.get("/courses", (req, res) => {
  res.send(courses);
});
```
- `app.get(path, handler)` registers a route that responds to `GET` requests on `/courses`.
- `res.send(...)` sends the array back to the client (Express automatically serializes it to JSON).

### Get a single course by ID (route parameters)
```js
app.get("/courses/:id", (req, res) => {
  let course = courses.find((course) => course.id === parseInt(req.params.id));
  if (!course) res.status(404).send('The Course Does not exist');

  res.send(course);
});
```
- `:id` in the path is a **route parameter** — Express captures whatever value is in that URL segment and makes it available as `req.params.id` (always a string, hence `parseInt`).
- `res.status(404).send(...)` demonstrates sending a custom HTTP status code when the resource isn't found.

> Learning note: this handler calls `res.send()` twice in the "not found" case (once for the 404, and again with `send(course)` where `course` is `undefined`). In a corrected version, the 404 branch should `return` immediately after sending the error response so a second response isn't attempted.

---

## 4. Creating Resources — `POST`

```js
app.post('/courses', (req, res) => {
    courses.push(req.body);
    res.send('Course Created');
    // We have to improve this
});
```
- `app.post(path, handler)` handles `POST` requests, typically used to **create** a new resource.
- `req.body` contains the JSON payload sent by the client (parsed thanks to `express.json()` middleware).
- The `// We have to improve this` comment flags that this is a naive implementation — e.g. no validation, no auto-generated `id`, no duplicate checking.

---

## 5. Planned but Not Yet Implemented

The file explicitly outlines the remaining REST operations as comments, to be covered in a later class:
```js
// update a resource - http method - put , patch
// delete a resource - http method - delete
```

This maps to the standard REST/CRUD convention:
| Operation | HTTP Method | Status in this class |
|---|---|---|
| Create | POST | ✅ Implemented |
| Read (all) | GET | ✅ Implemented |
| Read (one) | GET `/:id` | ✅ Implemented |
| Update | PUT / PATCH | ⏳ Not yet |
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
- **nodemon** — dev tool that auto-restarts the server on file changes (used during development, not in production).

---

## Files in this folder
| File | Purpose |
|---|---|
| [server/index.js](server/index.js) | Express app with GET/POST routes for `courses`, running on port 8004 |
| [server/package.json](server/package.json) | Project dependencies |

## Key Takeaways
- Express drastically simplifies routing compared to the raw `http` module from Class 1.
- `app.get`, `app.post`, etc. map directly to HTTP methods and REST conventions.
- `req.params` → data from the URL path; `req.body` → data from the request payload.
- Middleware (`express.json()`) must be registered before routes that depend on it.
