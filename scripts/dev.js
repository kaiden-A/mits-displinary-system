const { spawn } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");

const server = spawn("uv", ["run", "server"], {
  cwd: path.join(root, "server"),
  stdio: "inherit",
  shell: true,
});

const client = spawn("npm", ["run", "dev"], {
  cwd: path.join(root, "client"),
  stdio: "inherit",
  shell: true,
});

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  server.kill();
  client.kill();
  process.exit(code || 0);
}

server.on("exit", (code) => {
  console.log(`[server] exited with code ${code}`);
  shutdown(code);
});
client.on("exit", (code) => {
  console.log(`[client] exited with code ${code}`);
  shutdown(code);
});
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));