# Class 1 — Introduction to Node.js

## Topics Covered
- What Node.js is and running plain JS files outside the browser (`node script.js`)
- The built-in **`fs` (File System)** module — sync vs async APIs
- The built-in **`http` module** — creating a raw HTTP server without any framework
- Basic routing using `req.url` and a `switch` statement
- Serving plain text and HTML from a Node server

---

## 1. The `fs` Module

Node ships with a core module called `fs` that lets you interact with the file system (read, write, update, delete files).

```js
const fs = require('fs');
```

### Reading a file

**Synchronous** (blocks execution until the read finishes):
```js
const data = fs.readFileSync('f1.txt');
```

**Asynchronous** (non-blocking, uses a callback):
```js
fs.readFile('f1.txt', (err, data) => {
  if (err) {
    console.log(err);
  }
  console.log("F1 Data -> " + data);
});
```

> Note: because `readFile` is async, code written *after* it (like `console.log('Byeee')`) runs **before** the file read completes. This demonstrates Node's non-blocking, event-driven nature — see [script.js](script.js).

### Writing a file
```js
fs.writeFileSync('f2.txt', 'I am data from F3');
```
Creates the file if it doesn't exist, or **overwrites** it if it does.

### Updating / appending to a file
```js
fs.appendFileSync('f2.txt', ' Extended Data');
```
Adds content to the **end** of an existing file without overwriting what's already there.

### Deleting a file
```js
fs.unlinkSync('f3.txt');
console.log("F3 deleted");
```

All four operations (read, write, update, delete) were demonstrated in [index.js](index.js).

---

## 2. The `http` Module

Node's core `http` module can create a web server with zero external dependencies.

```js
const http = require("http");

const myServer = http.createServer((req, res) => {
  console.log(req.url);

  switch (req.url) {
    case "/":
      res.end("This is the Home Page");
      break;
    case "/about":
      res.end("This is the About page");
      break;
    case "/contact":
      res.end(`<html>...contact form HTML...</html>`);
      break;
  }
});

myServer.listen(8001, () => {
  console.log("Server started at port 8001");
});
```

Key ideas:
- `http.createServer(callback)` — the callback runs **every time a request hits the server**, receiving `req` (request) and `res` (response) objects.
- `req.url` tells you which path the client requested (`/`, `/about`, `/contact`, etc.) — this is how **manual routing** is done before learning Express.
- `res.end(...)` sends the response body back to the client and closes the connection.
- `res.end()` can send plain text or a full HTML string (as done for `/contact`).
- `server.listen(port, callback)` starts the server listening on a given port.

This is the manual, low-level way of building a server — it foreshadows why frameworks like **Express** (Class 2) are useful, since raw `http` requires hand-writing routing logic with `switch`/`if` statements.

---

## Files in this folder
| File | Purpose |
|---|---|
| [index.js](index.js) | `fs` module demo — read/write/append/delete a file |
| [script.js](script.js) | Async `fs.readFile` demo showing non-blocking behavior |
| [server/index.js](server/index.js) | Raw `http` server with manual routing (`/`, `/about`, `/contact`) |
| [f1.txt](f1.txt) / [f2.txt](f2.txt) | Sample text files used by the `fs` examples |
| [test.html](test.html) | Basic HTML page linking to `index.js` (browser-side script demo) |

## Key Takeaways
- Node.js modules can be **synchronous** (`*Sync` functions, blocking) or **asynchronous** (callback-based, non-blocking).
- The event loop means async operations don't pause the rest of the script — output order can differ from the order code is written.
- A web server can be built from scratch using only `http.createServer`, but routing/response handling quickly becomes verbose — motivating the move to Express next.
