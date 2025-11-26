import {
  Feature,
  Problem,
  Benefit,
  PricingPlan,
  FAQ,
  Instructor,
  StudioInfo,
} from "@/types";

// プレースホルダーモード（本番では false に）
export const usePlaceholders = true;

// ヒーローセクション
export const heroContent = {
  catchphrase: "自分の体を、\n自分で整える力を。",
  subcopy:
    "50代からでも遅くない。\n体の声に耳を傾け、しなやかな毎日を手に入れませんか？",
  ctaText: "体験レッスンを予約する",
  ctaHref: "#reservation",
};

// 3つの強み
export const features: Feature[] = [
  {
    title: "少人数制プライベートレッスン",
    description:
      "最大3名までの少人数制で、一人ひとりの体の状態に合わせた丁寧な指導を行います。初めての方も安心してご参加いただけます。",
    icon: "users",
  },
  {
    title: "50代・60代の方に最適",
    description:
      "無理のない動きから始められるプログラム設計。関節に負担をかけず、体幹を整えながら柔軟性を高めていきます。",
    icon: "heart",
  },
  {
    title: "姿勢改善・不調の根本解決",
    description:
      "肩こり、腰痛、猫背などの体の不調を根本から改善。正しい姿勢を身につけることで、日常生活がより快適に。",
    icon: "sparkles",
  },
];

// お悩みチェックリスト
export const problems: Problem[] = [
  { text: "最近、姿勢の悪さが気になってきた" },
  { text: "肩こり・腰痛がなかなか良くならない" },
  { text: "運動不足だけど、激しい運動は苦手" },
  { text: "年齢とともに体が硬くなってきた" },
  { text: "自分の体と向き合う時間を作りたい" },
  { text: "ジムは続かなかったけど、何か始めたい" },
];

// ピラティスの効果
export const benefits: Benefit[] = [
  {
    title: "姿勢改善",
    description: "体幹を整え、自然と美しい姿勢を維持できるようになります。",
    icon: "posture",
  },
  {
    title: "柔軟性アップ",
    description: "無理なく体を伸ばし、関節の可動域を広げていきます。",
    icon: "flexibility",
  },
  {
    title: "体幹強化",
    description: "インナーマッスルを鍛え、体の軸を安定させます。",
    icon: "core",
  },
  {
    title: "肩こり・腰痛改善",
    description: "正しい姿勢と動きで、慢性的な痛みを軽減します。",
    icon: "pain-relief",
  },
  {
    title: "呼吸の改善",
    description: "深い呼吸を意識することで、リラックス効果も得られます。",
    icon: "breath",
  },
  {
    title: "ストレス軽減",
    description: "体を動かしながら心も整え、心身のバランスを保ちます。",
    icon: "relax",
  },
];

// インストラクター情報
export const instructor: Instructor = {
  name: "田中 有紀",
  role: "ピラティスインストラクター",
  image: usePlaceholders ? "/images/placeholder/instructor.svg" : "/images/instructor.jpg",
  bio: "ピラティス歴10年。解剖学に基づいた指導で、一人ひとりの体に合わせたレッスンを提供しています。「体を知ることは、自分を知ること」をモットーに、皆様の健康づくりをサポートいたします。",
  qualifications: [
    "BASI Pilates認定インストラクター",
    "PHI Pilates Mat I & II",
    "解剖学基礎修了",
  ],
};

// 料金プラン
export const pricingPlans: PricingPlan[] = [
  {
    name: "体験レッスン",
    price: "3,000",
    unit: "円",
    description: "初めての方限定。まずは体験から始めてみませんか？",
    features: [
      "60分のプライベートレッスン",
      "カウンセリング込み",
      "動きやすい服装でOK",
      "マット・タオル無料レンタル",
    ],
    isPopular: true,
  },
  {
    name: "月4回コース",
    price: "20,000",
    unit: "円/月",
    description: "週1回ペースで無理なく続けられる人気のコース。",
    features: [
      "60分×月4回",
      "オンライン予約対応",
      "振替可能（当月内）",
      "体の変化を実感しやすい",
    ],
  },
  {
    name: "月8回コース",
    price: "36,000",
    unit: "円/月",
    description: "しっかり通いたい方に。週2回で効果を最大化。",
    features: [
      "60分×月8回",
      "1回あたり4,500円でお得",
      "オンライン予約対応",
      "振替可能（翌月まで）",
    ],
  },
];

// FAQ
export const faqs: FAQ[] = [
  {
    question: "ピラティスは初めてですが、大丈夫ですか？",
    answer:
      "はい、もちろんです。当スタジオに通われる方の約7割が初心者の方です。一人ひとりの体力や柔軟性に合わせてレッスンを進めますので、ご安心ください。",
  },
  {
    question: "体が硬くても参加できますか？",
    answer:
      "むしろ体が硬い方にこそ、ピラティスはおすすめです。無理のない範囲で少しずつ柔軟性を高めていくことができます。",
  },
  {
    question: "どんな服装で行けばいいですか？",
    answer:
      "動きやすい服装（Tシャツとレギンスなど）であれば何でも大丈夫です。靴は不要で、裸足または靴下で行います。",
  },
  {
    question: "持ち物は何が必要ですか？",
    answer:
      "タオルとお飲み物をお持ちください。マットは無料でお貸ししています。更衣スペースもございます。",
  },
  {
    question: "予約のキャンセルはできますか？",
    answer:
      "レッスン開始の24時間前までは無料でキャンセル・変更が可能です。それ以降のキャンセルは1回分の消化となりますのでご注意ください。",
  },
  {
    question: "駐車場はありますか？",
    answer:
      "スタジオ専用の駐車場を2台分ご用意しています。事前にご連絡いただければ確保いたします。",
  },
];

// スタジオ情報
export const studioInfo: StudioInfo = {
  name: "know（ノウ）",
  address: "〒420-0852 静岡県静岡市葵区紺屋町1-1 サンプルビル3F",
  phone: "054-000-0000",
  email: "info@know-pilates.jp",
  hours: [
    "月・水・金: 10:00〜20:00",
    "火・木: 10:00〜18:00",
    "土: 9:00〜17:00",
    "日・祝: 定休日",
  ],
  // Google Maps embed URL（ダミー：静岡市役所付近）
  mapUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3273.5!2d138.383!3d34.975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDU4JzMwLjAiTiAxMzjCsDIyJzU4LjgiRQ!5e0!3m2!1sja!2sjp!4v1234567890",
};

// CTA関連
export const ctaContent = {
  title: "まずは体験レッスンから",
  description:
    "ピラティスが初めての方も、運動に自信がない方も大歓迎。あなたの体に合ったレッスンをご提案します。",
  buttonText: "体験レッスンを予約する",
  buttonHref: "#reservation",
};
