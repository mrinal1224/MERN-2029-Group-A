# Class 4 — The MVC Pattern

## Topics Covered
- What the **MVC (Model-View-Controller)** pattern is and the problem it solves
- Splitting one monolithic `index.js` into `models/`, `controllers/`, and `routes/`
- `express.Router()` — mounting a group of related routes under one prefix
- Moving business logic out of the router and into **controller** functions
- CommonJS export patterns: `exports.name = fn` vs `module.exports = {...}`
- Loading environment variables safely with **`dotenv`**
- CRUD so far: Create, Read (all), Update — and the still-missing Delete
- A direct continuation of Class 3's security lesson, now actually fixed (partially)

---

## 1. The Problem: One Giant File

By Class 3, `index.js` was doing *everything*: connecting to the database, defining the schema, defining the model, and handling the route logic, all in one file. That's fine for a five-minute demo, but it collapses once you have 5 resources (Products, Users, Orders...) each needing their own CRUD — one file would balloon into hundreds of tangled lines.

**MVC (Model-View-Controller)** is a design pattern that splits an app into three responsibilities:
- **Model** — defines the *shape* of the data and talks to the database.
- **Controller** — contains the *business logic*: what should happen when a particular request comes in.
- **View** — traditionally the UI shown to the user (HTML templates). In a pure JSON API (like this one, built for a MERN frontend to consume), there's no server-rendered View — the JSON response *is* the "view" the client receives.

> **Analogy — A Restaurant Kitchen:** Think of the whole app as a restaurant.
> - The **Model** is the **pantry/inventory system** — it knows exactly what ingredients exist, their quantities, and enforces rules like "you can't have a negative stock count." It doesn't cook anything; it just manages the data.
> - The **Controller** is the **chef** — given an order ("create a product," "update this product's price"), the chef decides what to actually do: check the pantry, prepare the dish, and hand it back.
> - The **Router** is the **waiter/host** — they read the ticket ("a `PUT` request for `/update/5` just came in") and walk it to the *correct* chef's station, without cooking anything themselves.
>
> Class 2 and Class 3 had one person doing all three jobs at once in a single, cramped kitchen (`index.js`). Class 4 hires a proper waiter and a proper chef, and gives the pantry its own room.

---

## 2. The Model — `models/ProductModel.js`

```js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String, required: true },
    ratings: { type: Number },
    isInStock: { type: Boolean, required: true }
});

const ProductModel = mongoose.model('product', productSchema);

module.exports = ProductModel;
```
This is exactly the schema + model pattern from Class 3, just **moved into its own file** and exported with `module.exports` so any other file (like the controller) can `require()` it. This is the entire point of MVC — the model file's *only* job is describing and providing access to Product data; it knows nothing about HTTP, routes, or requests.

> **Concept explainer — why is `price` a `String` and not a `Number`?** This is likely a small oversight in the actual code (prices are usually stored as `Number` so you can do math/sorting on them), but it's a good, realistic example of the kind of schema design decision you should double check — see the practice questions.

---

## 3. The Controller — `controllers/productControllers.js`

```js
const ProductModel = require('../models/ProductModel.js');

exports.createProduct = async function (req, res) {
     let product = await ProductModel.create({
          product_name: req.body.product_name,
          price: req.body.price,
          description: req.body.description,
          isInStock: req.body.isInStock,
          ratings: req.body.ratings
     });

     console.log(product);
     res.send('Product created');
};

exports.getAllProducts = async function (req, res) {
     let products = await ProductModel.find();
     res.send(products);
};

exports.updateProduct = async function (req, res) {
     await ProductModel.findByIdAndUpdate(req.params.id, req.body);
     res.status(202).json({ message: 'prouduct updated' });
};

// Delete
```

Concept by concept:

- **`require('../models/ProductModel.js')`** — the controller imports the Model, but never touches `mongoose.connect` or the schema directly. It only knows "I have a `ProductModel` I can call methods on" — full separation of concerns.
- **`exports.createProduct = async function (req, res) {...}`** — this is the **CommonJS named export pattern**. Instead of building one big object and doing `module.exports = { createProduct, getAllProducts, updateProduct }` at the bottom, each function is attached directly onto the special `exports` object as it's defined. Both patterns work identically at runtime; this file just spreads the exports out line by line.
- **`ProductModel.find()`** — with no filter argument, this returns *every* document in the `products` collection — the Mongoose equivalent of `SELECT * FROM products`.
- **`ProductModel.findByIdAndUpdate(req.params.id, req.body)`** — looks up a single product by its Mongo `_id` (captured from the URL, e.g. `/update/64f...`) and merges in whatever fields are present in `req.body`. Only the fields you send are changed — you don't have to resend the entire object.
- **`res.status(202).json({...})`** — `202 Accepted` communicates "the update was processed." (See practice question 4 about whether this is actually the best-fitting status code.)
- **`// Delete`** — an honest placeholder comment. Deleting a product isn't implemented yet; that's left as an exercise (see Practice Questions).

> **Analogy — The Chef Never Talks to the Dining Room Directly:** Notice the controller functions take `(req, res)` — they still know about HTTP request/response objects, because in this simple setup the controller *is* the chef who also plates the dish (`res.send(...)`). In larger apps, some teams push even response-formatting into a separate layer, but for a class-level MVC project, "Controller decides logic AND shapes the response" is the standard, correct split.

---

## 4. The Router — `routes/productRoutes.js`

```js
const express = require('express');
const { createProduct, getAllProducts, updateProduct } = require('../controllers/productControllers.js');

const router = express.Router();

router.get('/getAllproducts', getAllProducts);
router.post('/create', createProduct);
router.put('/update/:id', updateProduct);

// router.delete()

module.exports = router;
```
- **`express.Router()`** creates a **mini, self-contained Express app** — a group of routes that can be defined in their own file and then "plugged in" to the main app under a shared prefix. It behaves exactly like `app.get`/`app.post`/`app.put`, just scoped to this file.
- Each route here does **nothing but wire a path + HTTP method to a controller function** — no business logic lives in this file at all. That's the whole discipline of MVC: routers route, controllers decide, models store.
- **`router.put('/update/:id', updateProduct)`** — this is how the `:id` route parameter used inside `updateProduct` (`req.params.id`) actually gets defined; the router is what captures it from the URL.

---

## 5. Wiring It All Together — `index.js`

```js
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes.js');

require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api/products', productRoutes);

mongoose
  .connect(process.env.dbUrl)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get('/', (req, res) => {
  res.send('Hello from the Server');
});

app.listen(8006, () => {
  console.log("server Started");
});
```

- **`app.use('/api/products', productRoutes)`** — this is the **mounting** step. Every route defined inside `productRoutes` gets the `/api/products` prefix automatically. So `router.get('/getAllproducts', ...)` actually becomes reachable at the full path:
  ```
  GET /api/products/getAllproducts
  POST /api/products/create
  PUT  /api/products/update/:id
  ```
  This is a huge win: the router file never needs to know or care what prefix it's mounted under — you could remount the exact same `productRoutes` under `/v2/products` later with zero changes inside that file.

> **Analogy — Departments in an Office Building:** `app.use('/api/products', productRoutes)` is like putting up a sign at the building entrance: "Everything with an address starting with `/api/products` — that's the 3rd floor, Products department." Once inside that floor, `productRoutes` decides exactly which room (`/create`, `/update/:id`, ...) handles you next — the front door doesn't need to know the floor's internal room layout.

### 5.1 `dotenv` — Finally Fixing Class 3's Security Problem

```js
require('dotenv').config();
...
mongoose.connect(process.env.dbUrl)
```
`dotenv` reads a local `.env` file and copies its key-value pairs into `process.env`, a special global object Node exposes for environment variables. So a `.env` file containing:
```
dbUrl = mongodb+srv://<username>:<password>@cluster0.p7o0qqj.mongodb.net/LMS?appName=Cluster0
```
lets the code reference `process.env.dbUrl` instead of typing the raw connection string (with real credentials) directly into a `.js` file that gets committed to Git.

> **Analogy — A Safe Instead of a Sticky Note on the Front Door:** Class 3's hardcoded credential was like writing your house key's shape on a sticky note taped to your front door, then mailing a photo of that door to the whole class (committing it to Git). `dotenv` is like putting the key in a small home safe (`.env`) instead — the code just says "go check the safe," and it's the *safe itself* that must never be shipped to anyone (`.gitignore`).
>
> ⚠️ **Important gap to close:** `dotenv` only helps if the `.env` file is *also* excluded from version control. **A `.env` file that gets committed to Git provides zero protection** — it's the equivalent of putting the key in the safe, then mailing the safe too. Check your project's `.gitignore` includes a line for `.env`, and if a real `.env` was ever committed, treat any credentials inside it as compromised and rotate them immediately (change the database password), the same way you would for Class 3's hardcoded string.

---

## 6. CRUD Status Check

| Operation | HTTP Method | Route | Controller | Status |
|---|---|---|---|---|
| Create | POST | `/api/products/create` | `createProduct` | ✅ |
| Read (all) | GET | `/api/products/getAllproducts` | `getAllProducts` | ✅ |
| Read (one) | GET `/:id` | — | — | ⏳ Not yet |
| Update | PUT | `/api/products/update/:id` | `updateProduct` | ✅ |
| Delete | DELETE | — | — | ⏳ Not yet (see practice questions) |

---

## Dependencies ([package.json](server/package.json))
```json
"dependencies": {
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "mongoose": "^9.9.3",
  "nodemon": "^3.1.14"
}
```
- **dotenv** — loads variables from a `.env` file into `process.env` so secrets never need to be typed directly into source files.

---

## Files in this folder
| File | Purpose |
|---|---|
| [server/index.js](server/index.js) | App entry point — connects DB, mounts middleware and routes, starts the server |
| [server/models/ProductModel.js](server/models/ProductModel.js) | Product schema + Mongoose model |
| [server/controllers/productControllers.js](server/controllers/productControllers.js) | Business logic for create/read/update products |
| [server/routes/productRoutes.js](server/routes/productRoutes.js) | Maps HTTP method + path to the correct controller function |
| [server/.env](server/.env) | Environment variables (e.g. `dbUrl`) — **should never be committed to Git** |

## Key Takeaways
- **MVC** splits responsibilities: **Model** = data shape + DB access, **Controller** = business logic, **Router** = mapping requests to the right controller — nothing does more than its one job.
- `express.Router()` creates a self-contained, mountable set of routes; `app.use(prefix, router)` attaches it under a URL prefix the router file itself never needs to know about.
- Controllers `require()` models but never touch `mongoose.connect` directly — the connection is entirely the app entry point's concern.
- `dotenv` moves secrets out of source code and into `process.env`, but it only actually protects you if the `.env` file itself is git-ignored — never committed.
- This project's CRUD is still missing **Delete** and **Read one by ID** — natural next steps, practiced below.

---

## Practice Questions

1. **Trace the flow:** Describe, step by step, everything that happens inside the app from the moment a `PUT /api/products/update/64f2a1b3c9e77a1234567890` request arrives to the moment a response is sent — name every file involved.

2. **Exports:** Explain the difference between `exports.createProduct = async function(){}` (used in this project) and writing `module.exports = { createProduct, getAllProducts, updateProduct }` once at the bottom of the file. Do they behave differently at runtime?

3. **Implement the missing DELETE:** Write a `deleteProduct` controller function using `ProductModel.findByIdAndDelete(req.params.id)`, wire it up in `productRoutes.js` as `router.delete('/delete/:id', deleteProduct)`, and make sure it responds with an appropriate status code and message.

4. **Status codes:** `createProduct` currently responds with the default `200 OK` status via `res.send('Product created')`. What HTTP status code is the more correct choice for a successful *creation*, and how would you change the code to use it? Is `202 Accepted` (used in `updateProduct`) the best fit for a synchronous update that already completed by the time the response is sent — why or why not?

5. **Security:** `require('dotenv').config()` is called at the very top of `index.js`, before `mongoose.connect(process.env.dbUrl)`. Explain why this ordering matters — what would happen to `process.env.dbUrl` if `dotenv.config()` were called *after* the `mongoose.connect(...)` line, or not called at all?

6. **Design judgment:** Suppose you want to add validation so that `createProduct` rejects a request missing `product_name` or `price` with a `400 Bad Request`. Which MVC layer should that validation logic live in — the router, the controller, or a brand-new layer (e.g. validation middleware)? Justify your answer, and explain what would go wrong if you put that validation logic inside `ProductModel.js` instead.
