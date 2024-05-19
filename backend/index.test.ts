import { test } from "vitest";
import { createBot } from "./createBot";

test("api", async () => {
  const res = await createBot({
    messages: [
      {
        role: "user",
        content: "My name is JOJO!",
      },
    ],
  });

  console.log(res);
});
