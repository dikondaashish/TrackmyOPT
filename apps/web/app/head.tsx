export default function Head() {
  return (
    <>
      {/* Preconnect to randomuser.me for faster testimonial image loading */}
      <link rel="preconnect" href="https://randomuser.me" />
      <link rel="dns-prefetch" href="https://randomuser.me" />
      
      {/* Preconnect to CDN if used for any external resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

      {/* Google Analytics (GA4) */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-LD9XN0RHXH"
      />
      <script
        // GA4 requires inline bootstrap code.
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-LD9XN0RHXH');`,
        }}
      />
    </>
  );
}
