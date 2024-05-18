import { randomUUID } from "crypto";
import { Bot, Chat } from "../common/struct";
import { IBotService, ICompletionService } from "./service";

import express from "express";
import bodyParser from "body-parser";
import Datastore from "nedb";

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

  put(bot: Omit<Bot, "id">): Promise<Bot> {
    return botDB.save(bot);
  }
}

class CompletionService implements ICompletionService {
  // TODO
  async post(chat: Chat): Promise<Chat> {
    return {
      messages: chat.messages.concat([
        {
          role: "assistant",
          content: `answer for ${chat.messages.at(-1)!.content}`,
        },
      ]),
    };
  }
}

const botService = new BotService();
const completionService = new CompletionService();

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
  const chat = req.body;
  const completion = await completionService.post(chat);
  res.json(completion);
});

app.use(express.static("dist"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
