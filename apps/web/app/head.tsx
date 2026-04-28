export default function Head() {
  return (
    <>
      {/* Preconnect hints for faster external resource loading */}
      <link rel="preconnect" href="https://randomuser.me" />
      <link rel="dns-prefetch" href="https://randomuser.me" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      {/* GA4 is loaded via next/script in layout.tsx */}
    </>
  );
}
