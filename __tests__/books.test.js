const db = require("../db");
const Book = require("../models/book");
const request = require("supertest");
const app = require("../app");
process.env.NODE_ENV === "test";

const book1 = {
  isbn: "0691161528",
  amazon_url: "http://a.co/eobPtX2",
  author: "Matthew Lane",
  language: "english",
  pages: 264,
  publisher: "Princeton University Press",
  title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
  year: 2010,
};

// missing year for testing data validation json schema
const book2 = {
  isbn: "0691161528",
  amazon_url: "http://a.co/eobPtX2",
  author: "Matthew Lane",
  language: "english",
  pages: 264,
  publisher: "Princeton University Press",
  title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
};

const book3 = {
  isbn: "0691161599",
  amazon_url: "http://a.co/eobPtX2",
  author: "Matthew Lane",
  language: "english",
  pages: 264,
  publisher: "Princeton University Press",
  title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
  year: 2010,
};

const book1updated = {
  isbn: "0691161528",
  amazon_url: "http://a.co/eobPtX2",
  author: "Matt",
  language: "english",
  pages: 2,
  publisher: "Princeton University Press",
  title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
  year: 2010,
};

describe("Testing book routes", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM books");
    await request(app).post(`/books`).send(book1);
  });

  describe("GET /books", function () {
    test("Gets all books", async function () {
      const response = await request(app).get(`/books`);
      expect(response.statusCode).toBe(200);
      expect(response.body.books[0]).toEqual(book1);

      expect(response.body.books).toHaveLength(1);
    });
  });

  describe("POST /books", function () {
    test("Creates a new book", async function () {
      const response = await request(app).post(`/books`).send(book3);
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ book: book3 });

      const getBooksResponse = await request(app).get(`/books/${book3.isbn}`);
      expect(getBooksResponse.body.book).toEqual(book3);
    });

    test("Checks failing validation on creating book", async function () {
      const response = await request(app).post(`/books`).send(book2);
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /books/[isbn]", function () {
    test("Gets book by isbn", async function () {
      const response = await request(app).get(`/books/${book1.isbn}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.book).toEqual(book1);
    });

    test("Checks get book by nonexistant isbn", async function () {
      const response = await request(app).get(`/books/1234567890`);
      expect(response.statusCode).toBe(404);
    });
  });

  describe("PUT /books/[isbn]", function () {
    test("Update a book", async function () {
      const response = await request(app)
        .put(`/books/${book1.isbn}`)
        .send(book1updated);
      expect(response.statusCode).toBe(200);
      expect(response.body.book.pages).toEqual(book1updated.pages);

      const getBooksResponse = await request(app).get(`/books`);
      expect(getBooksResponse.body.books[0].pages).toEqual(book1updated.pages);
      expect(getBooksResponse.body.books).toHaveLength(1);
    });
  });

  describe("DELETE /books/[isbn]", function () {
    test("Delete a book", async function () {
      const response = await request(app).delete(`/books/${book1.isbn}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: "Book deleted" });

      const getBooksResponse = await request(app).get(`/books`);
      expect(getBooksResponse.body.books).toHaveLength(0);
    });
  });
});

afterAll(async function () {
  await db.end();
});
