export const formatBytes = (bytes?: number | null) => {
  const size = bytes ?? 0;

  if (size < 1024) {
    return { value: size.toString(), unit: "B" };
  }

  if (size < 1024 * 1024) {
    return { value: (size / 1024).toFixed(2), unit: "KB" };
  }

  if (size < 1024 * 1024 * 1024) {
    return { value: (size / 1024 / 1024).toFixed(2), unit: "MB" };
  }

  return { value: (size / 1024 / 1024 / 1024).toFixed(2), unit: "GB" };
};
