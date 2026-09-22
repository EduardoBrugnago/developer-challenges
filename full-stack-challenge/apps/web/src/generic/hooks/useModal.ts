import { useCallback, useState } from "react";
import type { ModalOptions, ModalProps } from "../components/Modal";

export function useModal() {
  const [current, setCurrent] = useState<{
    options: ModalOptions;
    key: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const open = useCallback((options: ModalOptions) => {
    setCurrent((prev) => ({ options, key: (prev?.key ?? 0) + 1 }));
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const run = useCallback(
    async (action: () => boolean | Promise<boolean>) => {
      setLoading(true);
      try {
        if (await action()) setIsOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const onConfirm = current?.options.onConfirm;

  const props: ModalProps = {
    open: isOpen,
    loading,
    options: current?.options ?? null,
    contentKey: current?.key ?? 0,
    onClose: close,
    onConfirm: () => onConfirm && run(onConfirm),
  };

  return { open, close, run, props };
}
