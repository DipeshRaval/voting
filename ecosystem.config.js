module.exports = {
  apps: [
    {
      name: "Online Voting System",
      script: "index.js",
      instances: 5,
      wait_ready: true,
      exec_mode: "cluster",
    },
  ],
};
