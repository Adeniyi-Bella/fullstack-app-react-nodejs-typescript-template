import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@components/common/Button/Button";
import { Input } from "@components/common/Input/Input";
import { Card } from "@components/common/Card/Card";
import { useRegister } from "@hooks/api/useAuth";
import { Helpers } from "@lib/utils/helpers";
import type { RegisterData } from "@/types";
import { Footer } from "@/components/layout/Footer/Footer";

export const Register = memo(() => {
  const navigate = useNavigate();
  const { mutate: register, isPending, error } = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>();

  const onSubmit = useCallback(
    (data: RegisterData) => {
      // Generate a unique userId
      const userId = Helpers.generateId();

      register(
        { ...data, userId },
        {
          onSuccess: () => {
            navigate({ to: "/dashboard" });
          },
        }
      );
    },
    [register, navigate]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username"
              placeholder="johndoe"
              error={errors.username?.message}
              {...formRegister("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...formRegister("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...formRegister("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isPending}
              variant="secondary"
              fullWidth
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
});

Register.displayName = "Register";
