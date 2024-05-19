import { randomUUID } from "crypto";
import { Bot, Chat } from "../common/struct";
import { IBotService } from "./service";

import express from "express";
import bodyParser from "body-parser";
import Datastore from "nedb";
import { createBot } from "./createBot";
import { makeRequest } from "./api/makeRequest";

const jsonParser = bodyParser.json();

const app = express();
const port = 3000;

class BotDB {
  private db = new Datastore();

  getById(id: string) {
    return new Promise<Bot>((resolve) => {
      this.db.findOne({ id }, (err, doc) => {
        if (err) throw err;
        resolve(doc);
      });
    });
  }

  async save(_bot: Omit<Bot, "id">) {
    const id = randomUUID();
    const bot = { ..._bot, id };
    return new Promise<Bot>((resolve) => {
      this.db.insert(bot, (err) => {
        if (err) throw err;
        resolve(bot);
      });
    });
  }
}

const botDB = new BotDB();
class BotService implements IBotService {
  get(bot: Pick<Bot, "id">): Promise<Bot> {
    return botDB.getById(bot.id);
  }

  async put(_bot: Omit<Bot, "id" | "link">): Promise<Bot> {
    const bot = await createBot(_bot.chat);
    return botDB.save(bot);
  }
}

const botService = new BotService();

app.get("/api/bot/:id", async (req, res) => {
  const { id } = req.params;
  const bot = await botService.get({ id });
  res.json(bot);
});

app.put("/api/bot", jsonParser, async (req, res) => {
  const botMeta = req.body;
  const bot = await botService.put(botMeta);
  res.json(bot);
});

app.post("/api/completion", jsonParser, async (req, res) => {
  const chat: Chat = req.body;
  console.log(chat);

  // res.writeHead(200, {
  //   "Content-Type": "text/event-stream",
  //   "Cache-Control": "no-cache",
  //   Connection: "keep-alive",
  // });
  // let counter = 0;
  // const event = {
  //   name: "message",
  //   data: JSON.stringify({
  //     message: {
  //       role: "system",
  //       content: "a",
  //       type: "answer",
  //     },
  //   }),
  //   id: counter,
  // };
  // counter++;
  // const eventString = `event: ${event.name}\ndata: ${event.data}\n\n`;
  // res.write(eventString);

  // const event2 = {
  //   name: "done",
  //   data: ``,
  //   id: counter,
  // };
  // const eventString2 = `event: ${event2.name}\ndata: ${event2.data}\n\n`;
  // res.write(eventString2);

  // res.end();

  const request = makeRequest(chat);
  request.then(async ({ body }) => {
    const reader = body?.getReader();
    if (!reader) {
      return;
    }

    while (true) {
      const content = await reader.read();
      if (content?.done) {
        console.log("done1");
        res.end();
        return;
      }

      res.write(content.value);

      const str = new TextDecoder().decode(content.value);
      const match = str.match(/content":"(.*?)"/)?.[1] ?? "";
      process.stdout.write(match);
    }
  });
});

app.use(express.static("dist"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


