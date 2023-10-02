const http = require("http");
const cors = require("cors");
const express = require("express");

let app = express();

const corsOptions = {
  origin: "http://127.0.0.1:5500/index.html",
};

app.use(async (req, res, next) => {
  await next();
  res.setHeader(
    "Access-Control-Allow-Origin",
    "http://127.0.0.1:5500/index.html"
  );
});

const axios = function (url) {
  return new Promise((resolve, reject) => {
    return http.get(url + Date.now(), function (response) {
      if (response.statusCode === 200) {
        const data = [];
        response.on("data", (chunk) => {
          data.push(chunk);
        });

        response.on("end", () => {
          resolve(data.toString());
        });

        response.on("error", () => {
          reject("Request failed!");
        });
      }
    });
  });
};

const _goldDigger = async function () {
  try {
    const date = Date.now();
    const response = await axios(
      "http://bcast.kakagold.in:7767/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/kaka?_=" +
        date
    );

    console.log(response);
    let gold = 0;
    // For gold
    response.split("\n").map((line) => {
      const columns = line
        .split("\t")
        .map((col) => col.trim())
        .filter((col) => !!col);

      if (columns[1] === "GOLD 999 IMP WITH GST") {
        gold = parseInt(columns[3]);
      }
    });

    return gold;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
const _silverDigger = async function () {
  try {
    const date = Date.now();
    const response = await axios(
      "http://bcast.rakshabullion.com:7767/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/raksha?_=" +
        date
    );

    let silver = 0;
    // For gold
    response.split("\n").map((line) => {
      const columns = line
        .split("\t")
        .map((col) => col.trim())
        .filter((col) => !!col);

      if (columns[1] === "SILVER") {
        silver = parseInt(columns[3]);
      }
    });

    return silver;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/get-gold") {
    try {
      const goldValue = await _goldDigger();
      const silverValue = await _silverDigger();
      res.writeHead(200, { "Content-Type": "text/plain" });

      res.end(JSON.stringify({ goldValue, silverValue }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });

      res.end("Internal Server Error");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });

    res.end("Not Found");
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
