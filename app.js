const express = require("express");
const app = express();
const path = require("path");
const { Election, Quetion, Option } = require("./models");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  const ele = await Election.getElection();
  res.render("election", {
    ele,
  });
});

// election end points
app.get("/listOfElection", async (req, res) => {
  const ele = await Election.getElection();
  res.render("election", {
    ele,
  });
});

app.post("/addquetion/:id", async (req, res) => {
  console.log(req.body);
  console.log(req.params.id);
  try {
    const Que = await Quetion.addQuetion({
      title: req.body.title,
      description: req.body.desc,
      electionID: req.params.id,
    });
    res.redirect(`/election/${req.params.id}/quetion/${Que.id}/addOptions`);
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.post("/election", async (req, res) => {
  console.log(req.body);
  try {
    const election = await Election.addElection({
      title: req.body.title,
      url: req.body.url,
    });
    res.redirect("/listOfElection");
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.get("/election/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const election = await Election.findByPk(req.params.id);
    const que = await Quetion.getQuetions(req.params.id);
    res.render("display", {
      election,
      que,
    });
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.get("/election/:eId/quetion/:qId/addOptions", async (req, res) => {
  const election = await Election.findByPk(req.params.eId);
  const quetion = await Quetion.findByPk(req.params.qId);
  const Options = await Option.getOptions(req.params.qId);
  res.render("options", {
    Options,
    quetion,
    election,
  });
});

app.post("/election/:eId/quetion/:qId/addOptions", async (req, res) => {
  try {
    const option = await Option.addOption({
      optionName: req.body.name,
      queid: req.body.qid,
    });
    res.redirect(
      `/election/${req.params.eId}/quetion/${req.params.qId}/addOptions`
    );
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.delete("/delElection/:id", async (req, res) => {
  console.log("We are delete a election with ID: ", req.params.id);
  try {
    const affectedRow = await Election.remove(req.params.id);
    res.send(affectedRow ? true : false);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/delQuetion/:id", async (req, res) => {
  console.log("We are delete a quetion with ID: ", req.params.id);
  try {
    const affectedRow = await Quetion.remove(req.params.id);
    res.send(affectedRow ? true : false);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/delOption/:id", async (req, res) => {
  console.log("We are delete a option with ID: ", req.params.id);
  try {
    const affectedRow = await Option.remove(req.params.id);
    res.send(affectedRow ? true : false);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/modify/election/:id", async (req, res) => {
  try {
    const election = await Election.updateElection({
      id: req.params.id,
      title: req.body.title,
      url: req.body.url,
    });
    res.redirect("/listOfElection");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/modify/:eid/quetion/:id", async (req, res) => {
  try {
    await Quetion.updateQuetion({
      id: req.params.id,
      title: req.body.title,
      description: req.body.desc,
    });
    res.redirect(`/election/${req.params.eid}`);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/election/:eId/quetion/:qId/modifyOptions/:id", async (req, res) => {
  try {
    await Option.updateOption({
      id: req.params.id,
      optionName: req.body.optionName,
    });
    res.redirect(
      `/election/${req.params.eId}/quetion/${req.params.qId}/addOptions`
    );
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
