import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  useMe,
  useUpdateProfile,
  type AuthenticatedUser,
} from "@/service/api/auth/auth.api";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

type ProfileFieldErrors = Partial<
  Record<"name" | "currentPassword" | "newPassword" | "confirmPassword", string>
>;

type ApiErrorPayload = {
  error?: string;
  message?: string;
  validationError?: Array<{ path: string; message: string }>;
  validationErrors?: Array<{ path: string; message: string }>;
};

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const getPasswordValidationError = (password: string) => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `New password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `New password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }

  if (password.trim() !== password) {
    return "New password cannot start or end with a space.";
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "New password must include at least one letter and one number.";
  }

  return "";
};

const getErrorPayload = (error: unknown) =>
  (error as AxiosError<ApiErrorPayload>).response?.data;

const getProfileErrorState = (error: unknown) => {
  const payload = getErrorPayload(error);
  const issues = payload?.validationError ?? payload?.validationErrors ?? [];
  const fieldErrors: ProfileFieldErrors = {};

  issues.forEach((issue) => {
    if (issue.path.endsWith("name")) {
      fieldErrors.name = issue.message;
    }

    if (issue.path.endsWith("currentPassword")) {
      fieldErrors.currentPassword = issue.message;
    }

    if (issue.path.endsWith("newPassword")) {
      fieldErrors.newPassword = issue.message;
    }
  });

  const message =
    payload?.error ||
    payload?.message ||
    (error instanceof Error ? error.message : "") ||
    "Unable to update profile.";

  if (!fieldErrors.currentPassword && /current password/i.test(message)) {
    fieldErrors.currentPassword = message;
  }

  return {
    fieldErrors,
    formError: Object.keys(fieldErrors).length ? "" : message,
  };
};

function ProfileForm({ user }: { user: AuthenticatedUser }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const { mutate, isPending } = useUpdateProfile();

  const isPasswordChangeStarted = Boolean(
    currentPassword || newPassword || confirmPassword,
  );
  const hasProfileChanges =
    name.trim() !== user.name || isPasswordChangeStarted;
  const passwordRules = [
    {
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: newPassword.length >= PASSWORD_MIN_LENGTH,
    },
    { label: "Includes a letter", met: /[A-Za-z]/.test(newPassword) },
    { label: "Includes a number", met: /\d/.test(newPassword) },
    {
      label: "No leading or trailing spaces",
      met: newPassword.length > 0 && newPassword.trim() === newPassword,
    },
  ];
  const clearFieldError = (field: keyof ProfileFieldErrors) => {
    setSuccessMessage("");
    setFormError("");
    setFieldErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  };
  const clearPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setFieldErrors((current) => {
      const next = { ...current };

      delete next.currentPassword;
      delete next.newPassword;
      delete next.confirmPassword;

      return next;
    });
    setFormError("");
    setSuccessMessage("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const nextFieldErrors: ProfileFieldErrors = {};
    setSuccessMessage("");
    setFormError("");
    setFieldErrors({});

    if (trimmedName.length < 2) {
      nextFieldErrors.name = "Name must be at least 2 characters.";
    }

    if (isPasswordChangeStarted) {
      if (!currentPassword) {
        nextFieldErrors.currentPassword = "Enter your current password.";
      }

      if (!newPassword) {
        nextFieldErrors.newPassword = "Enter a new password.";
      } else {
        const passwordError = getPasswordValidationError(newPassword);

        if (passwordError) {
          nextFieldErrors.newPassword = passwordError;
        }

        if (currentPassword && newPassword === currentPassword) {
          nextFieldErrors.newPassword =
            "New password must be different from your current password.";
        }
      }

      if (!confirmPassword) {
        nextFieldErrors.confirmPassword = "Confirm your new password.";
      } else if (newPassword && confirmPassword !== newPassword) {
        nextFieldErrors.confirmPassword = "Passwords do not match.";
      }
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    mutate(
      {
        name: trimmedName,
        ...(currentPassword && newPassword
          ? { currentPassword, newPassword }
          : {}),
      },
      {
        onSuccess: (response) => {
          queryClient.setQueryData(["auth", "me"], response);
          clearPasswordFields();
          setSuccessMessage("Profile updated.");
        },
        onError: (error) => {
          const nextErrorState = getProfileErrorState(error);

          setFieldErrors(nextErrorState.fieldErrors);
          setFormError(nextErrorState.formError);
        },
      },
    );
  };
  const backLink =
    user.role === "admin"
      ? { label: "Back to dashboard", to: "/admin/dashboard" }
      : { label: "Back to chat", to: "/chat" };

  return (
    <main className="min-h-screen bg-background p-6">
      <section className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Edit profile
            </h1>
            <p className="mt-2 text-muted-foreground">
              Update your account details and review your profile information.
            </p>
          </div>
          <NavLink
            to={backLink.to}
            className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
            <span>{backLink.label}</span>
          </NavLink>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              Your Gravatar is based on your account email address.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="flex items-start gap-4">
                {user.gravatarUrl ? (
                  <img
                    alt={`${user.name}'s avatar`}
                    className="size-16 rounded-full"
                    src={user.gravatarUrl}
                  />
                ) : (
                  <span className="flex size-16 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
                    {getInitials(user.name)}
                  </span>
                )}

                <FieldGroup>
                  {formError ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                      {formError}
                    </div>
                  ) : null}

                  <Field data-invalid={Boolean(fieldErrors.name)}>
                    <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
                    <Input
                      aria-invalid={Boolean(fieldErrors.name)}
                      id="profile-name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        clearFieldError("name");
                      }}
                    />
                    <FieldDescription>
                      This name appears in your account menu.
                    </FieldDescription>
                    {fieldErrors.name ? (
                      <FieldError>{fieldErrors.name}</FieldError>
                    ) : null}
                  </Field>

                  <div className="border-t border-border pt-5">
                    <div className="mb-4">
                      <h2 className="text-sm font-medium text-foreground">
                        Change password
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Leave these fields empty to keep your current password.
                      </p>
                    </div>

                    <div className="grid gap-5">
                      <Field
                        data-invalid={Boolean(fieldErrors.currentPassword)}
                      >
                        <FieldLabel htmlFor="profile-current-password">
                          Current password
                        </FieldLabel>
                        <div className="relative">
                          <Input
                            aria-invalid={Boolean(
                              fieldErrors.currentPassword,
                            )}
                            autoComplete="current-password"
                            className="pr-10"
                            id="profile-current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(event) => {
                              setCurrentPassword(event.target.value);
                              clearFieldError("currentPassword");
                            }}
                          />
                          <Button
                            aria-label={
                              showCurrentPassword
                                ? "Hide current password"
                                : "Show current password"
                            }
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              setShowCurrentPassword((current) => !current)
                            }
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            {showCurrentPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                        <FieldDescription>
                          Required before setting a new password.
                        </FieldDescription>
                        {fieldErrors.currentPassword ? (
                          <FieldError>{fieldErrors.currentPassword}</FieldError>
                        ) : null}
                      </Field>

                      <Field data-invalid={Boolean(fieldErrors.newPassword)}>
                        <FieldLabel htmlFor="profile-new-password">
                          New password
                        </FieldLabel>
                        <div className="relative">
                          <Input
                            aria-invalid={Boolean(fieldErrors.newPassword)}
                            autoComplete="new-password"
                            className="pr-10"
                            id="profile-new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(event) => {
                              setNewPassword(event.target.value);
                              clearFieldError("newPassword");
                            }}
                          />
                          <Button
                            aria-label={
                              showNewPassword
                                ? "Hide new password"
                                : "Show new password"
                            }
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              setShowNewPassword((current) => !current)
                            }
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            {showNewPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                        {newPassword ? (
                          <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                            {passwordRules.map((rule) => (
                              <li
                                className={`flex items-center gap-2 ${
                                  rule.met
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                                key={rule.label}
                              >
                                {rule.met ? (
                                  <Check
                                    aria-hidden="true"
                                    className="size-4"
                                  />
                                ) : (
                                  <span
                                    aria-hidden="true"
                                    className="size-4 rounded-full border border-muted-foreground/40"
                                  />
                                )}
                                <span>{rule.label}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <FieldDescription>
                            Use at least {PASSWORD_MIN_LENGTH} characters with a
                            letter and a number.
                          </FieldDescription>
                        )}
                        {fieldErrors.newPassword ? (
                          <FieldError>{fieldErrors.newPassword}</FieldError>
                        ) : null}
                      </Field>

                      <Field data-invalid={Boolean(fieldErrors.confirmPassword)}>
                        <FieldLabel htmlFor="profile-confirm-password">
                          Confirm new password
                        </FieldLabel>
                        <div className="relative">
                          <Input
                            aria-invalid={Boolean(fieldErrors.confirmPassword)}
                            autoComplete="new-password"
                            className="pr-10"
                            id="profile-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(event) => {
                              setConfirmPassword(event.target.value);
                              clearFieldError("confirmPassword");
                            }}
                          />
                          <Button
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirmed password"
                                : "Show confirmed password"
                            }
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              setShowConfirmPassword((current) => !current)
                            }
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                        {fieldErrors.confirmPassword ? (
                          <FieldError>{fieldErrors.confirmPassword}</FieldError>
                        ) : null}
                      </Field>

                      {isPasswordChangeStarted ? (
                        <div>
                          <Button
                            onClick={clearPasswordFields}
                            type="button"
                            variant="ghost"
                          >
                            Clear password fields
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                    <Input disabled id="profile-email" value={user.email} />
                    <FieldDescription>
                      Email changes are not available from this profile page.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="profile-role">Role</FieldLabel>
                    <Input
                      className="capitalize"
                      disabled
                      id="profile-role"
                      value={user.role}
                    />
                  </Field>

                  {successMessage ? (
                    <p className="text-sm text-muted-foreground">
                      {successMessage}
                    </p>
                  ) : null}
                </FieldGroup>
              </div>
            </CardContent>
            <CardFooter className="mt-3 justify-end gap-3">
              <Button
                className="cursor-pointer transition-colors hover:bg-neutral-600"
                disabled={isPending || !hasProfileChanges}
                type="submit"
              >
                {isPending
                  ? "Saving..."
                  : isPasswordChangeStarted && name.trim() === user.name
                    ? "Update password"
                    : "Save changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </main>
  );
}

function Profile() {
  const { data } = useMe();
  const user = data?.data;

  if (!user) {
    return null;
  }

  return <ProfileForm key={user.id} user={user} />;
}

export default Profile;
