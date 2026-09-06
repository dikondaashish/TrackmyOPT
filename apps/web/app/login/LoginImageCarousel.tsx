import Image from "next/image";

export type LoginCarouselImage = {
  title: string;
  description: string;
  gradient: string;
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
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden p-16">
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
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 shadow-2xl">
              <div className="relative mb-12 flex items-center justify-center">
                <div
                  className={`w-full aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br ${img.gradient} opacity-30 shadow-xl`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#226BE7]/80 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20">
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
              </div>

              <div className="text-center text-white space-y-4">
                <h2 className="text-3xl font-bold">{img.title}</h2>
                <p className="text-lg text-blue-100 leading-relaxed">{img.description}</p>
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
                  ? "bg-white w-12 shadow-lg"
                  : "bg-white/40 w-2 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-8 right-8 text-center">
        <p className="text-white/60 text-sm">Private, secure, and reliable.</p>
      </div>
    </div>
  );
}
