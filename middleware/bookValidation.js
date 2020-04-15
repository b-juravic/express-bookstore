const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const ExpressError = require("../expressError");

function validateBook(req, res, next) {
  const result = jsonschema.validate(req.body, bookSchema);
  if (!result.valid) {
    // pass validation errors to error handler
    //  (the "stack" key is generally the most useful)
    let listOfErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  } else {
    return next();
  }
}

module.exports = validateBook;
