import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
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
import { useMe, useUpdateProfile } from "@/service/api/auth/auth.api";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

function Profile() {
  const queryClient = useQueryClient();
  const { data } = useMe();
  const user = data?.data;
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const { mutate, isPending } = useUpdateProfile();

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  if (!user) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    setSuccessMessage("");
    setFormError("");

    if (trimmedName.length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }

    if ((currentPassword || newPassword) && (!currentPassword || !newPassword)) {
      setFormError("Enter both current password and new password.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setFormError("New password must be at least 6 characters.");
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
          setCurrentPassword("");
          setNewPassword("");
          setSuccessMessage("Profile updated.");
        },
        onError: (error) => {
          setFormError(error.message || "Unable to update profile.");
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
                  <Field data-invalid={Boolean(formError)}>
                    <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
                    <Input
                      aria-invalid={Boolean(formError)}
                      id="profile-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                    <FieldDescription>
                      This name appears in your account menu.
                    </FieldDescription>
                    {formError ? <FieldError>{formError}</FieldError> : null}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="profile-current-password">
                      Current password
                    </FieldLabel>
                    <Input
                      id="profile-current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                    />
                    <FieldDescription>
                      Required only when changing your password.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="profile-new-password">
                      New password
                    </FieldLabel>
                    <Input
                      id="profile-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                    <FieldDescription>
                      Use at least 6 characters.
                    </FieldDescription>
                  </Field>

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
                disabled={
                  isPending ||
                  (name.trim() === user.name && !currentPassword && !newPassword)
                }
                type="submit"
              >
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </main>
  );
}

export default Profile;
