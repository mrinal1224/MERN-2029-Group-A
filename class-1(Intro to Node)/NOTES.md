# Class 1 — Introduction to Node.js

## Topics Covered
- What Node.js actually is, and why it lets JavaScript run outside the browser
- The V8 engine, the event loop, and why Node is "non-blocking"
- The built-in **`fs` (File System)** module — sync vs async APIs
- The built-in **`http` module** — creating a raw HTTP server without any framework
- Basic manual routing using `req.url` and a `switch` statement
- Serving plain text and HTML from a Node server
- Why raw Node quickly becomes painful, motivating Express (Class 2)

---

## 1. What Is Node.js, Really?

JavaScript was born to run **inside a browser** — click a button, validate a form, animate a div. It had no concept of reading files or opening network ports because a webpage was never supposed to touch your hard disk.

Node.js takes the same V8 JavaScript engine that powers Google Chrome and drops it into a **standalone program** that runs directly on your operating system, with extra built-in modules (`fs`, `http`, `path`, etc.) that give JavaScript "hands" to touch the file system, the network, and the OS.

> **Analogy — Fish with Gills:** Browser JavaScript is like a fish — it can only survive in the water of the browser (the DOM, `window`, `document`). Node.js is like giving that fish a pair of gills that let it breathe air: the same JavaScript language, but now it can live on a server, read/write files, and listen for network requests — things a browser tab is deliberately not allowed to do (imagine a website silently deleting files on your laptop!).

You run a plain JS file with Node directly from the terminal, no browser needed:
```bash
node script.js
```

---

## 2. The Event Loop & Non-Blocking I/O (The "Why" Behind Everything)

Node.js runs your JS on a **single thread**, yet it can handle thousands of file reads / network calls "at once" without freezing. It does this by handing slow tasks (disk I/O, network calls, timers) off to the system, continuing to run other code, and only coming back to your callback once that slow task finishes. This is called being **event-driven** and **non-blocking**.

> **Analogy — Restaurant Waiter:** A blocking (synchronous) waiter takes your order, walks to the kitchen, and **stands there** watching the food cook before serving the next table — everyone else starves waiting. A non-blocking (asynchronous) waiter takes your order, hands it to the kitchen, and immediately goes to take other tables' orders. When your food is ready, the kitchen "calls" the waiter (a **callback**) to come deliver it. Node.js is the second waiter — one thread, but never idle-blocked on slow work.

This single idea explains a very common beginner "surprise": code that is written *later* in the file can run *before* code written earlier, if the earlier code was asynchronous.

---

## 3. The `fs` Module — Talking to the File System

Node ships with a core module called `fs` that lets you read, write, update, and delete files.

```js
const fs = require('fs');
```

`require()` is Node's way of importing a module — think of it as "bring me this toolbox."

### 3.1 Reading a file

**Synchronous** — blocks execution until the read finishes (the waiter who waits at the kitchen):
```js
const data = fs.readFileSync('f1.txt');
console.log(data.toString());
```
Nothing else in your program runs until this line completes. Fine for small scripts/config files at startup; bad for a server handling many users at once (one slow disk read would freeze *everyone*).

**Asynchronous** — non-blocking, uses a callback (the waiter who takes other orders):
```js
fs.readFile('f1.txt', (err, data) => {
  if (err) {
    console.log(err);
  }
  console.log("F1 Data -> " + data);
});

console.log('Byeee');
```
Real output order from [script.js](script.js):
```
hello
Byeee
F1 Data -> <contents of f1.txt>
```
`'Byeee'` prints **before** the file content, even though it's written *after* the `readFile` call — the read is handed off to the OS, Node moves on immediately, and the callback only fires once the disk actually returns the data. This is Node's non-blocking, event-driven nature in action.

### 3.2 Writing a file
```js
fs.writeFileSync('f2.txt', 'I am data from F3');
```
Creates the file if it doesn't exist, or **completely overwrites** it if it does — like replacing every page in a notebook with a fresh one.

### 3.3 Updating / appending to a file
```js
fs.appendFileSync('f2.txt', ' Extended Data');
```
Adds content to the **end** of an existing file without erasing what's already there — like adding a new entry to the bottom of a diary instead of tearing pages out.

### 3.4 Deleting a file
```js
fs.unlinkSync('f3.txt');
console.log("F3 deleted");
```
All four operations (read, write, update, delete) were demonstrated together in [index.js](index.js).

> **Analogy — Librarian:** `readFileSync` is asking the librarian for a book and standing at the counter until she physically hands it to you. `readFile` (async) is texting the librarian "send me the book," walking off to browse other shelves, and getting a text back the moment it's ready. `writeFileSync` is replacing a book on the shelf entirely; `appendFileSync` is writing a new note on the last blank page instead; `unlinkSync` is removing the book from the shelf forever.

---

## 4. The `http` Module — Building a Server From Scratch

Node's core `http` module can create a fully working web server with **zero external dependencies** — no Express, no framework, just Node itself.

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
- `http.createServer(callback)` — the callback runs **every single time** a request hits the server. It receives `req` (the incoming request) and `res` (the outgoing response you build and send back).
- `req.url` tells you which path the client requested (`/`, `/about`, `/contact`, etc.). This is how **manual routing** is done before you learn a framework — you literally inspect the URL string yourself.
- `res.end(...)` writes the response body and closes the connection — nothing more can be sent after this.
- `res.end()` can send plain text or a full HTML string as its argument, exactly like the `/contact` route does with a whole HTML document as a template literal.
- `server.listen(port, callback)` starts the server listening for connections on a given port (here, `8001` — like a specific door number on the same building/IP address).

> **Analogy — A Receptionist with One Sheet of Instructions:** Imagine a hotel receptionist who has no computer system — just a single sheet of paper listing `if the guest says "gym" send them to floor 2, if they say "pool" send them to floor 1...`. That's exactly what this `switch(req.url)` block is doing by hand. It technically works, but every new page means editing that one paper sheet, there's no clean way to handle `/contact` submitting a form back to the server, and mistakes (forgetting a `break`, forgetting a route) are easy. This manual pain is *exactly* why frameworks like **Express** (Class 2) exist — Express is the professional front-desk software that replaces the handwritten sheet.

### 4.1 A Quick Illustrative Extension

To connect this to something more concrete, adding a new route by hand looks like this:
```js
case "/services":
  res.end("Here are our services: Web, Mobile, Cloud");
  break;
```
Notice: no automatic 404 handling. If none of the `case`s match and there's no `default`, the request just... hangs, because `res.end()` is never called. This is a subtle bug worth noticing early.

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
- Node.js lets JavaScript run outside the browser by pairing the V8 engine with system-level modules like `fs` and `http`.
- Node is single-threaded but **non-blocking** — slow I/O is handed off, and callbacks fire later, which is why async output order can differ from the order the code is written in.
- `fs` operations come in blocking (`*Sync`) and non-blocking (callback-based) flavors — choose based on whether you can afford to freeze execution.
- A web server can be built from scratch using only `http.createServer`, but routing/response handling by hand (`switch` on `req.url`) is verbose, error-prone, and has no built-in 404 handling — motivating a move to Express next.

---

## Practice Questions

1. **Conceptual:** In [script.js](script.js), why does `'Byeee'` print to the console *before* `'F1 Data -> ...'`, even though the `console.log('Byeee')` line appears *after* the `fs.readFile(...)` call in the source code?

2. **Sync vs Async:** Rewrite this async snippet to use the synchronous version of `readFile` instead, and explain one real situation where using the sync version on a live web server would be a bad idea:
   ```js
   fs.readFile('f1.txt', (err, data) => {
     console.log(data.toString());
   });
   ```

3. **Code:** `fs.unlinkSync('f3.txt')` will throw an error and crash the script if `f3.txt` doesn't exist. Modify [index.js](index.js) so it only attempts the delete if the file actually exists (hint: look up `fs.existsSync`).

4. **Routing:** Add a new `/services` route to [server/index.js](server/index.js) that responds with `"Our services: Web, Mobile, Cloud"`. Then explain what currently happens if a client requests a URL like `/pricing` that has no matching `case` — and why that's a problem.

5. **Big picture:** List three things you would have to write by hand using only the `http` module that a framework like Express gives you for free (think about: 404 handling, parsing JSON bodies, defining many routes cleanly).

6. **True/False (justify each answer):**
   - a) `fs.readFileSync` returns a Promise.
   - b) Node.js can run a `.js` file without any HTML page or browser involved.
   - c) In `http.createServer((req, res) => {...})`, the callback only runs once, when the server starts.
