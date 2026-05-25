import { useEffect, useState, type FormEvent } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRenameChat, type Chat } from "@/service/api/chats/chat.api";

interface RenameChatDialogProps {
  chat: Pick<Chat, "id" | "title"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameChatDialog({
  chat,
  open,
  onOpenChange,
}: RenameChatDialogProps) {
  const [title, setTitle] = useState("");
  const {
    mutate: renameChat,
    isPending,
    error,
    reset,
  } = useRenameChat();

  useEffect(() => {
    if (open) {
      setTitle(chat?.title ?? "");
      reset();
    }
  }, [chat?.title, open, reset]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = title.trim();
    if (!chat || !nextTitle || nextTitle === chat.title) {
      return;
    }

    renameChat(
      {
        chatId: chat.id,
        title: nextTitle,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
            <DialogDescription>
              Update the title shown in your recent chats.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="chat-title">Chat title</FieldLabel>
              <Input
                id="chat-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isPending}
                aria-invalid={Boolean(error)}
                autoFocus
              />
              <FieldError>
                {error ? "Unable to rename chat. Please try again." : null}
              </FieldError>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="cursor-pointer hover:bg-neutral-500"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer hover:bg-neutral-500"
              disabled={
                isPending || !title.trim() || title.trim() === chat?.title
              }
            >
              {isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
