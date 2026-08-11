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
      res.end(`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Us</title>
      </head>
      <body>
      
          <header>
              <h1>Get in Touch</h1>
              <p>Have a question or want to work together? Send us a message below.</p>
          </header>
      
          <main>
              <!-- Contact Form -->
              <section>
                  <h2>Send Us a Message</h2>
                  <form action="/submit-contact" method="POST">
                      <div>
                          <label for="name">Full Name:</label><br>
                          <input type="text" id="name" name="name" required placeholder="Jane Doe">
                      </div>
                      <br>
                      <div>
                          <label for="email">Email Address:</label><br>
                          <input type="email" id="email" name="email" required placeholder="jane@example.com">
                      </div>
                      <br>
                      <div>
                          <label for="subject">Subject:</label><br>
                          <input type="text" id="subject" name="subject" required placeholder="How can we help?">
                      </div>
                      <br>
                      <div>
                          <label for="message">Message:</label><br>
                          <textarea id="message" name="message" rows="5" required placeholder="Write your message here..."></textarea>
                      </div>
                      <br>
                      <button type="submit">Send Message</button>
                  </form>
              </section>
      
              <hr>
      
              <!-- Direct Contact Info -->
              <section>
                  <h2>Contact Information</h2>
                  <ul>
                      <li><strong>Email:</strong> <a href="mailto:contact@example.com">contact@example.com</a></li>
                      <li><strong>Phone:</strong> <a href="tel:+11234567890">+1 (123) 456-7890</a></li>
                      <li><strong>Address:</strong> 123 Main Street, Suite 100, City, Country</li>
                      <li><strong>Hours:</strong> Mon - Fri: 9:00 AM - 5:00 PM</li>
                  </ul>
              </section>
          </main>
      
          <footer>
              <p>&copy; 2026 Your Brand Name. All rights reserved.</p>
          </footer>
      
      </body>
      </html>`);
      break;
  }

});

myServer.listen(8001, () => {
  console.log("Server started at port 8001");
});
