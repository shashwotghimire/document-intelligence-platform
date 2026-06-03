import { Link } from "react-router-dom";
import { useState } from "react";
import type React from "react";
import type { AxiosError } from "axios";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card2";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegisterResponse } from "@/service/api/auth/auth.api";
import { useRegister } from "@/service/api/auth/auth.api";
import { GitHubSignupButton } from "@/components/GitHubButton";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getRegisterErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    "Unable to create your account. Please try again."
  );
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [data, setData] = useState<RegisterResponse | null>(null);
  const { mutate, isPending, isError, error } = useRegister();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (password !== confirmPassword) {
      form
        .querySelector<HTMLInputElement>("#confirm-password")
        ?.setCustomValidity("Passwords do not match");
      form.reportValidity();
      return;
    }
    form
      .querySelector<HTMLInputElement>("#confirm-password")
      ?.setCustomValidity("");
    setData(null);
    mutate(
      { name, email, password },
      {
        onSuccess(data) {
          setData(data);
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        },
        onError: (err: unknown) => {
          console.error("Register failed", err);
        },
      },
    );
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex overflow-hidden">
        <img
          src="/auth-visual.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute left-10 top-10">
          <Logo />
        </div>
      </div>

      <div className="flex justify-center lg:items-center overflow-y-auto py-10 px-6">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Build your document workspace
            </h1>
            <p className="text-lg text-muted-foreground">
              Create an account to upload, organize, and ask better questions of
              every file.
            </p>
          </div>

          <Card className="w-full">
            <form onSubmit={handleRegister}>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      onInput={(event) =>
                        event.currentTarget.setCustomValidity("")
                      }
                      required
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    By creating an account, you agree to the terms and privacy
                    policy.
                  </p>

                  {data ? (
                    <p className="text-sm text-emerald-600">{data.message}</p>
                  ) : null}

                  {isError ? (
                    <p className="text-sm text-destructive">
                      {getRegisterErrorMessage(error)}
                    </p>
                  ) : null}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full cursor-pointer transition-colors hover:bg-neutral-600"
                >
                  {isPending ? "Creating account..." : "Create account"}
                </Button>
                <GitHubSignupButton />
                <p className="text-sm text-muted-foreground">
                  Already have a workspace?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
