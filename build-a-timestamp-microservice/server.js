import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line


function handleTimestamp(dateParam, res) {
  let parsedDate;

  if (!dateParam) {
    parsedDate = new Date();
  } else if (/^\d+$/.test(dateParam)) {
    parsedDate = new Date(Number(dateParam));
  } else {
    parsedDate = new Date(dateParam);
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  res.json({
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString(),
  });
}

app.get("/api", (_req, res) => {
  handleTimestamp(undefined, res);
});

app.get("/api/:date", (req, res) => {
  handleTimestamp(req.params.date, res);
});


// Do not change code below this line

const PORT = 8000;
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});