import { SectionTitle, Accordion } from "@/components/ui";
import { faqs } from "@/data/content";

export function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-primary-50">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <SectionTitle
          title="よくあるご質問"
          subtitle="ご不明な点がございましたら、お気軽にお問い合わせください。"
        />

        <Accordion items={faqs} />
      </div>
    </section>
  );
}
