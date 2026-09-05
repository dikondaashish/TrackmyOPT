import assert from "node:assert/strict";
import { createBlogMetadata } from "./blog-metadata";

const meta = createBlogMetadata({
  title: "STEM OPT Guide",
  description: "How STEM OPT works",
  slugOrPath: "stem-opt-extension-guide",
});

assert.equal(
  meta.alternates?.canonical,
  "https://www.trackmyopt.com/blog/stem-opt-extension-guide"
);
assert.equal(meta.openGraph?.url, "https://www.trackmyopt.com/blog/stem-opt-extension-guide");
assert.equal((meta.twitter as { card?: string } | undefined)?.card, "summary_large_image");
assert.equal((meta.twitter as { title?: string } | undefined)?.title, "STEM OPT Guide");

console.log("blog-metadata ok");
