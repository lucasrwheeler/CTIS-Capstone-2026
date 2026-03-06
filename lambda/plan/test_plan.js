const { handler } = require('./index');

async function run() {
  const event = {
    body: JSON.stringify({
      completed: [
        "CTIS 210",
        "CTIS 221",
        "CTIS 243"
      ],
      upcomingTerm: "Spring"
    })
  };

  const response = await handler(event);

  console.log("Status:", response.statusCode);
  console.log("Body:", JSON.parse(response.body));
}

run();