/** Only needed when web Vitest imports pure extension DOM helpers. */
declare const chrome: {
  runtime: {
    sendMessage(message: unknown): Promise<unknown>;
  };
};
