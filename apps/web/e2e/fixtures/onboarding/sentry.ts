// Fixture-only stand-in: the actual SDK and privacy-safe failure reporting are
// covered by unit tests and the production Next build. Never send test errors.
export function captureException(error: Error) {
  console.error(error.message);
}
