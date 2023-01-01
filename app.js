const express = require("express");
const app = express();
const path = require("path");
const { Election, Quetion, Option, Voter } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
app.set("views", path.join(__dirname, "views"));

// for csrf token
app.use(cookieParser("Important string"));
app.use(csrf("123456789iamasecret987654321look", ["POST", "PUT", "DELETE"]));

app.get("/", async (req, res) => {
  const ele = await Election.getElection();
  res.render("index", {
    title: "Todo Application",
    csrfToken: req.csrfToken(),
  });
});

// election end points
app.get("/listOfElection", async (req, res) => {
  const ele = await Election.getElection();
  res.render("election", {
    ele,
    csrfToken: req.csrfToken(),
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
    const voters = await Voter.getVoters(req.params.id);
    res.render("display", {
      election,
      que,
      totalVoter: voters.length,
      csrfToken: req.csrfToken(),
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
    csrfToken: req.csrfToken(),
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
    return res.status(422).json(error);
  }
});

app.delete("/delQuetion/:id", async (req, res) => {
  console.log("We are delete a quetion with ID: ", req.params.id);
  try {
    const affectedRow = await Quetion.remove(req.params.id);
    res.send(affectedRow ? true : false);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.delete("/delOption/:id", async (req, res) => {
  console.log("We are delete a option with ID: ", req.params.id);
  try {
    const affectedRow = await Option.remove(req.params.id);
    res.send(affectedRow ? true : false);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
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
    return res.status(422).json(error);
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
    return res.status(422).json(error);
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
    return res.status(422).json(error);
  }
});

app.get("/election/:eid/preview", async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.eid);
    const quetions = await Quetion.getQuetions(req.params.eid);
    const options = [];

    for (let i = 0; i < quetions.length; i++) {
      const op = await Option.getOptions(quetions[i].id);
      options.push(op);
    }

    res.render("preview", {
      election,
      quetions,
      options,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.get("/election/:eid/voter", async (req, res) => {
  const voters = await Voter.getVoters(req.params.eid);
  res.render("voter", {
    electionID: req.params.eid,
    voters,
    csrfToken: req.csrfToken(),
  });
});

app.post("/election/:eid/addvoter", async (req, res) => {
  try {
    await Voter.addVoter({
      voterId: req.body.voterId,
      password: req.body.password,
      electionId: req.params.eid,
    });

    res.redirect(`/election/${req.params.eid}/voter`);
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.delete("/delVoter/:id", async (req, res) => {
  console.log("We are delete a Voter with ID: ", req.params.id);
  try {
    const affectedRow = await Voter.remove(req.params.id);
    res.send(affectedRow ? true : false);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.post("/election/:eid/modify/voter/:id", async (req, res) => {
  try {
    const voter = await Voter.findByPk(req.params.id);
    const updatedVoter = voter.updateVoter(req.body.pwd);

    res.redirect(`/election/${req.params.eid}/voter`);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

// sign in ,out,up
app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "signUp",
    csrfToken: req.csrfToken(),
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "login",
    csrfToken: req.csrfToken(),
  });
});

app.get("/signout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = app;
