"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AccordionItem({
  question,
  answer,
  isOpen = false,
  onToggle,
}: AccordionItemProps) {
  return (
    <div className="border-b border-primary-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full py-5 px-4 flex items-center justify-between",
          "text-left text-lg font-medium text-primary-800",
          "hover:bg-primary-50 transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset",
          "min-h-[44px]" // 50-60代向けタッチターゲット
        )}
        aria-expanded={isOpen}
      >
        <span className="pr-4">{question}</span>
        <span
          className={cn(
            "flex-shrink-0 w-6 h-6 flex items-center justify-center",
            "transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        >
          <svg
            className="w-5 h-5 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-5 text-neutral-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: { question: string; answer: string }[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-primary-200 overflow-hidden",
        className
      )}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
