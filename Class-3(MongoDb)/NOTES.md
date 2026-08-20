# Class 3 — MongoDB & Mongoose

## Topics Covered
- What MongoDB is, and how it differs from a traditional SQL database
- Documents & collections — MongoDB's core building blocks
- **Mongoose** — the ODM (Object Data Modeling) library used to talk to MongoDB from Node
- Connecting to a MongoDB Atlas cluster with `mongoose.connect()`
- Defining a **Schema** (shape + validation rules for your data)
- Compiling a schema into a **Model** (the object you actually use for CRUD)
- Creating a document with `Model.create()` inside an `async` route handler
- A real security lesson: hardcoded database credentials

---

## 1. What Is MongoDB? (And Why Not Just Use SQL?)

Up through Class 2, data lived in a plain JS array that vanished every time the server restarted. MongoDB is a **database** — it makes data durable (survives restarts) and shareable across multiple servers/users.

MongoDB is a **NoSQL, document-oriented** database. Instead of rigid tables with fixed columns (like SQL/MySQL/Postgres), MongoDB stores data as flexible, JSON-like **documents** grouped into **collections**.

| SQL (e.g. MySQL) | MongoDB |
|---|---|
| Table | Collection |
| Row | Document |
| Column | Field |
| Rigid schema enforced by the DB engine | Flexible by default (Mongoose lets *you* add structure back) |

> **Analogy — Filing Cabinets vs. Flexible Folders:** A SQL table is like a pre-printed form filing cabinet — every single form in the "Employees" drawer *must* have exactly the fields "Name, Age, Salary" in that order, no more, no less, enforced by the cabinet itself. MongoDB is like a drawer of folders where each folder is a JSON note card — one employee's card could have an extra "Nickname" field that another doesn't, because nothing *forces* every card to match. Mongoose is you, the disciplined office manager, voluntarily agreeing to always fill out a house style template (the **Schema**) even though the drawer itself wouldn't stop you from deviating.

---

## 2. Mongoose — The Translator Between Node and MongoDB

MongoDB by itself understands its own query language/BSON format. **Mongoose** is a library that lets you describe your data using plain JavaScript objects/classes, and it handles translating that into MongoDB operations for you (and adds validation on top).

```js
const mongoose = require("mongoose");
```

### 2.1 Connecting to the Database
```js
const dbUrl =
  "mongodb+srv://<username>:<password>@cluster0.p7o0qqj.mongodb.net/LMS?appName=Cluster0";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });
```
- `mongodb+srv://` is the connection protocol for MongoDB Atlas (the managed cloud version of MongoDB).
- The URL packs together: **username**, **password**, the **cluster address** (`cluster0.p7o0qqj.mongodb.net`), and the **database name** (`LMS`) all in one string — like a full postal address plus the door key combined into one line.
- `mongoose.connect(url)` returns a **Promise** — `.then()` runs once the connection succeeds, `.catch()` runs if it fails (wrong password, no internet, IP not whitelisted, etc).

> ⚠️ **Real Security Issue Found In This Code — Read This Carefully**
> The actual file in this folder has the database username **and password typed directly into the source code** as plain text. This is a serious problem for two reasons:
> 1. Anyone with access to the code (or the Git history, even after you "delete" the line later — old commits still have it!) can log into your database.
> 2. If this repository is ever pushed to a public GitHub repo, the credentials are exposed to the entire internet within minutes (bots actively scan public repos for exactly this pattern).
>
> The fix — **never hardcode secrets** — is to move the connection string into an **environment variable** loaded from a `.env` file that is excluded from Git via `.gitignore`. This is exactly what **Class 4** introduces with the `dotenv` package (`process.env.dbUrl`). If you find real credentials committed anywhere in this project's Git history, treat them as compromised and **rotate (change) the database password** in MongoDB Atlas immediately — deleting the line from the latest file does *not* remove it from history.

### 2.2 Defining a Schema
```js
const courseSchema = new mongoose.Schema({
  course_name: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
  },
  isPublished: {
    type: Boolean,
    required: true,
  },
});
```
A `Schema` describes the **shape** of a document: field names, their types (`String`, `Number`, `Boolean`, `Date`, arrays, nested objects, etc.), and validation rules like `required: true`. Mongoose enforces this at the application layer even though MongoDB itself wouldn't require it.

> **Analogy — Blueprint vs. House:** A `Schema` is an architect's **blueprint** — it says "every house built from this plan must have exactly one front door, a roof, and at least 2 windows." It's not a house you can live in yet; it's the *plan* for one.

### 2.3 Compiling a Model
```js
const CourseModel = mongoose.model("course", courseSchema);
```
A **Model** is what you get when you hand the blueprint to a construction company — it's a reusable factory object that can build ("create"), find, update, and delete real documents that match the schema's shape.

> **Analogy — Factory From a Blueprint:** If `courseSchema` is the blueprint, `CourseModel` is the **factory** that actually stamps out houses (documents) matching that blueprint, and also knows how to go inspect, renovate, or demolish existing ones (find/update/delete).

**Naming quirk worth knowing:** `mongoose.model("course", courseSchema)` was given the singular name `"course"`, but Mongoose automatically **lowercases and pluralizes** it to name the actual MongoDB collection `courses`. This is a common source of confusion for beginners who go looking for a collection literally named `course` and can't find it.

---

## 3. Creating a Document — `POST /api/courses`

```js
app.post('/api/courses', async (req, res) => {
    let course = await CourseModel.create({
        course_name: req.body.course_name,
        instructor: req.body.instructor,
        isPublished: req.body.isPublished,
        ratings: req.body.ratings
    });

    res.send('Course Created', course);
});
```
- The handler is marked `async`, which lets us `await` the database call instead of nesting `.then()` callbacks.
- `CourseModel.create({...})` inserts a new document into the `courses` collection and returns the saved document (including its auto-generated `_id`) once the write completes.
- `await` pauses *this specific request's handler* (not the whole server — other requests are still served concurrently) until the database confirms the write.

> **Analogy — Ordering at a Counter With a Buzzer:** `await` is like ordering food at a counter that gives you a buzzer instead of making you stand there. You (this specific request) step aside and wait for your buzzer, but the counter keeps serving other customers (other requests) in the meantime. When your buzzer goes off (the Promise resolves), you continue exactly where you left off.

> ⚠️ **Learning note — a real bug in this code:** `res.send('Course Created', course)` looks like it should send both the string *and* the course object, but **`res.send()` only accepts a single argument** — the second argument, `course`, is silently ignored by Express. The client only ever receives the plain text `"Course Created"` and never sees the actual saved document (with its generated `_id`). **The fix** is to send one combined value, typically as JSON:
> ```js
> res.status(201).json({ message: 'Course Created', course });
> ```
> (`201 Created` is also the more correct status code here than the default `200 OK` — see the practice questions.)

---

## 4. Async/Await vs. `.then()/.catch()` — Two Styles, Same Idea

The connection code uses `.then()/.catch()`; the route handler uses `async/await`. Both handle the same underlying concept (a Promise), just with different syntax:

```js
// .then()/.catch() style
mongoose.connect(dbUrl)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

// async/await style (equivalent behavior)
async function connectDB() {
  try {
    await mongoose.connect(dbUrl);
    console.log("DB Connected");
  } catch (err) {
    console.log(err);
  }
}
connectDB();
```
`async/await` is generally preferred in modern code because it reads top-to-bottom like synchronous code, and `try/catch` handles errors the same way you're used to from regular JS.

---

## Dependencies ([package.json](server/package.json))
```json
"dependencies": {
  "express": "^5.2.1",
  "mongodb": "^7.5.0",
  "mongoose": "^9.9.3",
  "nodemon": "^3.1.14"
}
```
- **mongoose** — the ODM used to define schemas/models and talk to MongoDB with plain JS.
- **mongodb** — the lower-level official MongoDB driver that Mongoose itself is built on top of.

---

## Files in this folder
| File | Purpose |
|---|---|
| [server/index.js](server/index.js) | Connects to MongoDB Atlas, defines a `Course` schema/model, and exposes `POST /api/courses` |
| [server/package.json](server/package.json) | Project dependencies |
| [f1.txt](f1.txt) | Empty placeholder file |

## Key Takeaways
- MongoDB stores flexible, JSON-like **documents** inside **collections** — no rigid table structure enforced by the database itself.
- **Mongoose** lets you re-impose structure voluntarily via a **Schema**, then compiles that schema into a **Model** used for all CRUD operations.
- `mongoose.model("course", schema)` auto-pluralizes to a `courses` collection — the name you pass is singular by convention, not the literal collection name.
- `await Model.create(...)` inserts a document and pauses only the current request until MongoDB confirms the write — other requests are unaffected.
- **Never hardcode database credentials in source code** — this class's real code is a live example of the mistake that Class 4 fixes with environment variables.

---

## Practice Questions

1. **Conceptual:** In your own words, explain the difference between a MongoDB *document* and a *collection*, and map each to its closest SQL equivalent.

2. **Naming:** If you write `mongoose.model("student", studentSchema)`, what will the actual MongoDB collection be named, and why?

3. **Bug fix:** Explain exactly why `res.send('Course Created', course)` fails to return the created course to the client, and rewrite the line so the client receives both a message and the full saved course object as JSON.

4. **Schema design:** Write a Mongoose schema for a `Student` model with fields: `name` (required string), `age` (number), and `enrolledCourses` (an array of strings).

5. **Security:** This class's actual code hardcodes a MongoDB username and password directly in `index.js`. Explain, step by step, how you would fix this using an environment variable — and why simply deleting the line later isn't enough if the code was ever committed to Git.

6. **Refactor:** Rewrite the `.then()/.catch()` connection block into an `async` function using `try/catch` instead, keeping the same console log behavior on success and failure.
