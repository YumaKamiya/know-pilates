import { SectionTitle } from "@/components/ui";
import { usePlaceholders } from "@/data/content";

const galleryImages = [
  { src: "/images/gallery/studio-1.jpg", alt: "スタジオ内観" },
  { src: "/images/gallery/lesson-1.jpg", alt: "レッスン風景" },
  { src: "/images/gallery/equipment-1.jpg", alt: "ピラティス機器" },
  { src: "/images/gallery/studio-2.jpg", alt: "受付・待合スペース" },
];

export function Gallery() {
  return (
    <section id="gallery" className="py-20 md:py-28 bg-primary-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <SectionTitle
          title="スタジオ紹介"
          subtitle="落ち着いた空間で、ゆったりとレッスンを受けていただけます。"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl overflow-hidden"
            >
              {usePlaceholders ? (
                <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 text-primary-500 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-primary-600">
                      {image.alt}
                    </span>
                  </div>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
