"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, UserRound } from "lucide-react";

export type LoginFormValues = {
  username: string;
  password: string;
};

type LoginFormProps = {
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
};

export default function LoginForm({
  onSubmit,
  isSubmitting = false,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleFormSubmit = async (values: LoginFormValues) => {
    if (onSubmit) {
      await onSubmit(values);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      <div>
        <label htmlFor="login-username" className="mb-1.5 block text-sm font-medium text-gray-700">
          Username
        </label>
        <div className="relative">
          <UserRound aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            {...register("username", { required: true })}
            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <KeyRound aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register("password", { required: true })}
            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-11 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Eye aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Log in
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}