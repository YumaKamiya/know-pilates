import { z } from "zod";

export const reservationSchema = z.object({
  date: z.string().min(1, "日付を選択してください"),
  time: z.string().min(1, "時間を選択してください"),
  name: z
    .string()
    .min(1, "お名前を入力してください")
    .max(50, "お名前は50文字以内で入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスを入力してください"),
  phone: z
    .string()
    .min(1, "電話番号を入力してください")
    .regex(
      /^[0-9-]{10,14}$/,
      "電話番号はハイフンありまたはなしで入力してください（例: 090-1234-5678）"
    ),
  message: z.string().max(500, "メッセージは500文字以内で入力してください").optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
