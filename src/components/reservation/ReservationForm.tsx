"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, parse } from "date-fns";
import { ja } from "date-fns/locale";
import {
  reservationSchema,
  type ReservationFormData,
} from "@/lib/validations/reservation";
import { cn } from "@/lib/utils";

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

type FormStep = "date" | "time" | "info" | "confirm" | "complete";

export function ReservationForm() {
  const [step, setStep] = useState<FormStep>("date");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      date: "",
      time: "",
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");

  // 予約可能な日付を生成（今日から30日間）
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    const dayOfWeek = date.getDay();
    // 日曜日（0）は除外
    if (dayOfWeek === 0) return null;
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "M月d日（E）", { locale: ja }),
    };
  }).filter(Boolean) as { value: string; label: string }[];

  // 日付選択時に空き枠を取得
  useEffect(() => {
    if (selectedDate) {
      setIsLoadingSlots(true);
      setError(null);
      fetch(`/api/reservation/slots?date=${selectedDate}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
            setAvailableSlots([]);
          } else {
            setAvailableSlots(data.slots || []);
          }
        })
        .catch(() => {
          setError("空き枠の取得に失敗しました");
          setAvailableSlots([]);
        })
        .finally(() => setIsLoadingSlots(false));
    }
  }, [selectedDate]);

  const onSubmit = async (data: ReservationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reservation/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "予約に失敗しました");
      }

      setStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "予約に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-2">
        {["date", "time", "info", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === s || ["date", "time", "info", "confirm"].indexOf(step) > i
                  ? "bg-accent-500 text-white"
                  : "bg-primary-200 text-primary-600"
              )}
            >
              {i + 1}
            </div>
            {i < 3 && (
              <div
                className={cn(
                  "w-8 h-1 mx-1",
                  ["date", "time", "info", "confirm"].indexOf(step) > i
                    ? "bg-accent-500"
                    : "bg-primary-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (step === "complete") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-accent-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-primary-800 mb-4">
          ご予約ありがとうございます
        </h3>
        <p className="text-neutral-600 mb-6 leading-relaxed">
          予約内容の確認メールをお送りしました。
          <br />
          当日お会いできることを楽しみにしております。
        </p>
        <div className="bg-primary-50 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-sm text-primary-700">
            <strong>ご予約日時</strong>
            <br />
            {selectedDate &&
              format(parse(selectedDate, "yyyy-MM-dd", new Date()), "yyyy年M月d日（E）", {
                locale: ja,
              })}{" "}
            {selectedTime}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto">
      {renderStepIndicator()}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: 日付選択 */}
      {step === "date" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary-800 text-center mb-6">
            ご希望の日付を選択してください
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableDates.map((date) => (
              <button
                key={date.value}
                type="button"
                onClick={() => {
                  setValue("date", date.value);
                  setValue("time", "");
                  setStep("time");
                }}
                className={cn(
                  "p-4 rounded-lg border-2 text-center transition-all min-h-[60px]",
                  selectedDate === date.value
                    ? "border-accent-500 bg-accent-50"
                    : "border-primary-200 hover:border-primary-400"
                )}
              >
                <span className="text-lg font-medium">{date.label}</span>
              </button>
            ))}
          </div>
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>
      )}

      {/* Step 2: 時間選択 */}
      {step === "time" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary-800 text-center mb-2">
            ご希望の時間を選択してください
          </h3>
          <p className="text-center text-neutral-600 mb-6">
            {selectedDate &&
              format(parse(selectedDate, "yyyy-MM-dd", new Date()), "M月d日（E）", {
                locale: ja,
              })}
          </p>

          {isLoadingSlots ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-neutral-600">空き状況を確認中...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-600">この日は予約できません</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => {
                    setValue("time", slot.time);
                    setStep("info");
                  }}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all min-h-[48px]",
                    !slot.available
                      ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      : selectedTime === slot.time
                      ? "border-accent-500 bg-accent-50"
                      : "border-primary-200 hover:border-primary-400"
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep("date")}
              className="px-6 py-3 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
            >
              戻る
            </button>
          </div>
          {errors.time && (
            <p className="text-red-500 text-sm">{errors.time.message}</p>
          )}
        </div>
      )}

      {/* Step 3: お客様情報入力 */}
      {step === "info" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary-800 text-center mb-6">
            お客様情報を入力してください
          </h3>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className={cn(
                "w-full px-4 py-3 rounded-lg border-2 text-lg",
                errors.name
                  ? "border-red-300 focus:border-red-500"
                  : "border-primary-200 focus:border-accent-500"
              )}
              placeholder="山田 花子"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              className={cn(
                "w-full px-4 py-3 rounded-lg border-2 text-lg",
                errors.email
                  ? "border-red-300 focus:border-red-500"
                  : "border-primary-200 focus:border-accent-500"
              )}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register("phone")}
              className={cn(
                "w-full px-4 py-3 rounded-lg border-2 text-lg",
                errors.phone
                  ? "border-red-300 focus:border-red-500"
                  : "border-primary-200 focus:border-accent-500"
              )}
              placeholder="090-1234-5678"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              ご質問・ご要望（任意）
            </label>
            <textarea
              {...register("message")}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-primary-200 focus:border-accent-500 text-lg"
              placeholder="体の不調や気になる点があればお知らせください"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep("time")}
              className="px-6 py-3 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
            >
              戻る
            </button>
            <button
              type="button"
              onClick={() => {
                // 必須フィールドのバリデーション
                const name = watch("name");
                const email = watch("email");
                const phone = watch("phone");
                if (name && email && phone) {
                  setStep("confirm");
                }
              }}
              className="px-8 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors min-h-[48px]"
            >
              確認へ進む
            </button>
          </div>
        </div>
      )}

      {/* Step 4: 確認 */}
      {step === "confirm" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary-800 text-center mb-6">
            ご予約内容をご確認ください
          </h3>

          <div className="bg-primary-50 rounded-xl p-6 space-y-4">
            <div className="flex justify-between py-2 border-b border-primary-200">
              <span className="text-primary-600">ご予約日</span>
              <span className="font-medium">
                {selectedDate &&
                  format(parse(selectedDate, "yyyy-MM-dd", new Date()), "yyyy年M月d日（E）", {
                    locale: ja,
                  })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-primary-200">
              <span className="text-primary-600">お時間</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-primary-200">
              <span className="text-primary-600">お名前</span>
              <span className="font-medium">{watch("name")}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-primary-200">
              <span className="text-primary-600">メール</span>
              <span className="font-medium">{watch("email")}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-primary-200">
              <span className="text-primary-600">電話番号</span>
              <span className="font-medium">{watch("phone")}</span>
            </div>
            {watch("message") && (
              <div className="py-2">
                <span className="text-primary-600 block mb-1">ご要望</span>
                <span className="font-medium">{watch("message")}</span>
              </div>
            )}
          </div>

          <div className="bg-accent-50 rounded-xl p-4">
            <p className="text-accent-800 text-center">
              <strong>体験レッスン料金: 3,000円</strong>
              <br />
              <span className="text-sm">（当日現金でお支払いください）</span>
            </p>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep("info")}
              className="px-6 py-3 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors min-h-[48px] disabled:opacity-50"
            >
              {isSubmitting ? "予約中..." : "予約を確定する"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
