import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import type React from "react";
import type { AxiosError } from "axios";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card2";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/service/api/auth/auth.api";
import { GitHubLoginButton } from "@/components/GitHubButton";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getLoginErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    "We could not log you in. Check your details and try again."
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending, isError, error } = useLogin();
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get("error");
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate(
      { email, password },
      {
        onSuccess() {
          setEmail("");
          setPassword("");
        },
        onError: (err: unknown) => {
          console.error("Login failed", err);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/auth-topology.jpg"
          alt="Network topology visualization for secure document intelligence"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute left-10 top-10">
          <Logo to="/" />
        </div>
      </div>

      <div className="flex justify-center overflow-y-auto px-6 py-10 lg:items-center">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground">
              Pick up where you left off.
            </p>
          </div>

          <Card className="w-full">
            <form onSubmit={handleLogin}>
              <CardContent>
                <div className="flex flex-col gap-4">
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
                      autoComplete="current-password"
                      placeholder="Type your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  {isError ? (
                    <p className="text-sm text-destructive">
                      {getLoginErrorMessage(error)}
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
                  {isPending ? "Logging in..." : "Log in"}
                </Button>
                <GitHubLoginButton />
                {errorMessage ? (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  No account yet?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Make one
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

export default Login;
