import { createServer } from "http";
import app from "./app";
import { setupWebSocketServer } from "./websocket/server";
import { startOverdueTaskJob } from "./jobs/overdue-task.job";

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

setupWebSocketServer(httpServer);

startOverdueTaskJob();

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});