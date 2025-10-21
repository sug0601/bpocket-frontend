export const fetcher = (url: string) =>
  fetch(`http://localhost:3000${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
})