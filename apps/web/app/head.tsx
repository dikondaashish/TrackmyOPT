export default function Head() {
  return (
    <>
      {/* Preconnect to randomuser.me for faster testimonial image loading */}
      <link rel="preconnect" href="https://randomuser.me" />
      <link rel="dns-prefetch" href="https://randomuser.me" />
      
      {/* Preconnect to CDN if used for any external resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    </>
  );
}
