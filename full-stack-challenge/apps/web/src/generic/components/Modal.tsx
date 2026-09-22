import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  type ButtonProps,
  type DialogProps,
} from "@mui/material";

export interface ModalOptions {
  title: string;
  icon?: ReactNode;
  content: ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  cancelLabel?: string;
  confirmLabel: string;
  confirmColor?: ButtonProps["color"];
  confirmTestId?: string;
  formId?: string;
  onConfirm?: () => boolean | Promise<boolean>;
}

export interface ModalProps {
  open: boolean;
  loading: boolean;
  options: ModalOptions | null;
  contentKey: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function Modal({
  open,
  loading,
  options,
  contentKey,
  onClose,
  onConfirm,
}: ModalProps) {
  if (!options) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth={options.maxWidth ?? "xs"}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {options.icon}
        {options.title}
      </DialogTitle>
      <DialogContent key={contentKey}>
        {typeof options.content === "string" ? (
          <DialogContentText>{options.content}</DialogContentText>
        ) : (
          options.content
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {options.cancelLabel ?? "Cancel"}
        </Button>
        <Button
          variant="contained"
          color={options.confirmColor}
          disabled={loading}
          data-testid={options.confirmTestId}
          {...(options.formId
            ? { type: "submit", form: options.formId }
            : { onClick: onConfirm })}
        >
          {options.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
