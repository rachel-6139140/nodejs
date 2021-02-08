import * as dotenv from "dotenv";
import { connectToDB } from "./db/mongoose";
import { ServerApp } from "./server";

dotenv.config();

if (!process.env.MONGO_URI ) {
  throw new Error("MONGO_URI must be provided");
}

const run = async () => {
  await connectToDB();
  console.log(`Connected to mongodb successfuly!!!`);
  const port = parseInt(process.env.PORT!) || 4000;
  new ServerApp().start(port);
};

run().catch((err) => {
  console.log(err.err.message);
  process.exit(0);
});
