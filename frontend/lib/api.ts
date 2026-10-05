const base = process.env.NEXT_PUBLIC_API_URL || "";

export async function api<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${base}/api${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body instanceof FormData
        ? undefined
        : { "Content-Type": "application/json" },
    body:
      body instanceof FormData
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(
      typeof detail.detail === "string"
        ? detail.detail
        : `Request failed (${response.status}).`,
    );
  }
  return response.json();
}

export async function download(id: string, query: unknown, format: string) {
  const response = await fetch(`${base}/api/datasets/${id}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...(query as object), format }),
  });
  if (!response.ok)
    throw new Error("Export failed. The session may have expired.");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = `autoinsight.${format === "markdown" ? "md" : format}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function deleteDataset(id: string) {
  await fetch(`${base}/api/datasets/${id}`, { method: "DELETE" });
}
