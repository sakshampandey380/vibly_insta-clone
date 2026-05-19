import { app } from "./app.js";
import { env } from "./config/env.js";
import { initializeStore } from "./data/store.js";

async function bootstrap() {
  await initializeStore();

  app.listen(env.PORT, () => {
    console.log(`Vibly API listening on http://localhost:${env.PORT}`);
  });
}

void bootstrap();

