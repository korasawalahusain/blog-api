import cors from "cors";
import bodyParser from "body-parser";
import { Authenticator, UserAuth } from "./middlewares";
import { AdminRoutes, UserRoutes, BlogRoutes, AuthRoutes } from "./routes";
import express, { Express, NextFunction, Request, Response } from "express";

const port = 4000;
const app: Express = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({ origin: "*" }));
app.use("/public", express.static("uploads"));

app.use("/auth", AuthRoutes);
app.use("/admin", AdminRoutes);

app.use(Authenticator);

app.use("/user", UserRoutes);
app.use("/blog", UserAuth, BlogRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use((error: any, _req: any, res: Response, _next: NextFunction) => {
  res.status(error.status);
  return res.json({
    code: error.status,
    success: false,
    message: error.message,
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
