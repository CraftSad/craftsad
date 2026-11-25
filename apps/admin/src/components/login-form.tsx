"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
} from "@acme/ui";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

type Step = "email" | "otp";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redirectPath =
    next?.startsWith("/") &&
    !["/", "\\", "\t", "\n", "\r"].includes(next.charAt(1))
      ? next
      : "/";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);

  async function requestCode() {
    const value = email.trim();
    if (!value) {
      toast.error("Введите почту");
      return;
    }
    setPending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: value,
        type: "sign-in",
      });
      if (error) {
        toast.error(error.message || "Не удалось отправить код");
        return;
      }
      setStep("otp");
      toast.success("Код отправлен на почту");
    } catch {
      toast.error("Не удалось отправить код");
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(code: string) {
    if (code.length !== 6) return;
    setPending(true);
    try {
      const { error } = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp: code,
      });
      if (error) {
        toast.error(error.message || "Неверный код");
        setOtp("");
        return;
      }
      router.replace(redirectPath as Route);
      router.refresh();
    } catch {
      toast.error("Неверный код");
      setOtp("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {step === "email" ? "Вход в админ-панель" : "Введите код"}
        </CardTitle>
        <CardDescription>
          {step === "email"
            ? "Доступ только для администраторов. Введите почту, привязанную к аккаунту."
            : `Мы отправили 6-значный код на ${email}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void requestCode();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="login-email">Электронная почта</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                disabled={pending}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@3dbirki.ru"
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Отправка…" : "Получить код"}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (value.length === 6) void verifyCode(value);
              }}
              disabled={pending}
            >
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("email");
                setOtp("");
              }}
            >
              Изменить почту
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
