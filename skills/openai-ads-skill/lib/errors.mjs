export class FriendlyError extends Error {
  constructor(message, suggestions = []) {
    super(message);
    this.name = "FriendlyError";
    this.suggestions = suggestions;
  }
}

export function formatFriendlyError(error) {
  if (error instanceof FriendlyError) {
    const suggestions = error.suggestions.length
      ? `\n\nSuggestions:\n${error.suggestions.map((item) => `- ${item}`).join("\n")}`
      : "";
    return `Error: ${error.message}${suggestions}`;
  }

  return `Unexpected error: ${error.message || String(error)}`;
}
