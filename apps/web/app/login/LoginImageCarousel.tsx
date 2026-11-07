import Image from "next/image";

export type LoginCarouselImage = {
  title: string;
  description: string;
};

type LoginImageCarouselProps = {
  images: LoginCarouselImage[];
  currentImageIndex: number;
  onSelectIndex: (index: number) => void;
};

export function LoginImageCarousel({
  images,
  currentImageIndex,
  onSelectIndex,
}: LoginImageCarouselProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden p-16">
      <div className="flex-1 flex items-center justify-center relative">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute w-full max-w-lg transition-all duration-1000 ${
              index === currentImageIndex
                ? "opacity-100 transform translate-x-0 scale-100"
                : index < currentImageIndex
                  ? "opacity-0 transform -translate-x-full scale-95"
                  : "opacity-0 transform translate-x-full scale-95"
            }`}
          >
            <div className="bg-slate-800 dark:bg-slate-900 border border-ink-border rounded-xl p-12">
              <div className="mb-10 flex items-center justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-[#226BE7] flex items-center justify-center">
                  <Image
                    src="/TrackMyOPT Logo/logo.gif"
                    alt="TrackMyOPT Logo"
                    width={96}
                    height={96}
                    className="w-20 h-20 md:w-24 md:h-24 object-contain"
                    unoptimized
                  />
                </div>
              </div>

              <div className="text-center text-white space-y-4">
                <h2 className="text-3xl font-bold">{img.title}</h2>
                <p className="text-lg text-ink-muted leading-relaxed">{img.description}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => onSelectIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-white w-12"
                  : "bg-slate-600 w-2 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-8 right-8 text-center">
        <p className="text-ink-muted text-sm">Private, secure, and reliable.</p>
      </div>
    </div>
  );
}
