import mongoose from "mongoose";
import { app } from "./app";
import { CommentCreatedListener } from "./events/listeners/comment-created-listener";
import { CommentDeletedEventListener } from "./events/listeners/comment-deleted-listener";
import { CommentUpdatedEventListener } from "./events/listeners/comment-updated-listener";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new CommentCreatedListener(natsWrapper.client).listen();
    new CommentUpdatedEventListener(natsWrapper.client).listen();
    new CommentDeletedEventListener(natsWrapper.client).listen();
    
    /* Mongoose internally keeps track of this connection, so that anytime we use 
       mongoose in any other parts of our code, the package is under-the-hood managing
       connecting us to the same instance */
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("connected to mongo");
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!");
  });
};

start();
