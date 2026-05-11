import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { AxiosError } from "axios";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card2";
import {
  useVerifyEmail,
  type VerifyEmailResponse,
} from "@/service/api/auth/auth.api";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getVerifyEmailErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    "Unable to verify your email. Please try again."
  );
};

const EmailVerify = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [data, setData] = useState<VerifyEmailResponse | null>(null);
  const { mutate, isPending, isError, error } = useVerifyEmail();

  const handleVerifyEmail = () => {
    if (!token) {
      return;
    }

    setData(null);
    mutate(
      { token },
      {
        onSuccess(data) {
          setData(data);
        },
        onError: (err: unknown) => {
          console.error("Email verification failed", err);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex">
        <img
          src="/auth-visual.jpg"
          alt="Documents arranged on a workspace"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute left-10 top-10">
          <Logo />
        </div>
      </div>

      <div className="flex justify-center overflow-y-auto px-6 py-10 lg:items-center">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Verify your email
            </h1>
            <p className="text-lg text-muted-foreground">
              Confirm your email address to finish setting up your document
              workspace.
            </p>
          </div>

          <Card className="w-full">
            <CardContent>
              <div className="flex flex-col items-center gap-5">
                {data ? (
                  <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <CheckCircle2 aria-hidden="true" />
                  </div>
                ) : null}

                {!token ? (
                  <p className="text-center text-sm text-destructive">
                    Verification token is missing from this link.
                  </p>
                ) : null}

                {data ? (
                  <p className="text-center text-sm text-green-600">
                    {data.message}
                  </p>
                ) : null}

                {isError ? (
                  <p className="text-center text-sm text-destructive">
                    {getVerifyEmailErrorMessage(error)}
                  </p>
                ) : null}

                {data ? (
                  <Button
                    className="w-full cursor-pointer transition-colors hover:bg-neutral-600"
                    asChild
                  >
                    <Link to="/login">Go to login</Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={!token || isPending}
                    onClick={handleVerifyEmail}
                    className="w-full cursor-pointer transition-colors hover:bg-neutral-600"
                  >
                    {isPending ? "Verifying..." : "Verify email"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;
