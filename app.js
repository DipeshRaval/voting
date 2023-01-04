const express = require("express");
const app = express();
const path = require("path");
const { Election, Quetion, Option, Voter, Admin } = require("./models");
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

//passport js for aurthentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRound = 10;

app.use(
  session({
    secret: "my-secret-ket-232423234234234234",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  "user-local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      Admin.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          // console.log(user.email);
          if (user) {
            const bool = await bcrypt.compare(password, user.password);
            if (bool) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Invalid password",
              });
            }
          } else {
            return done(null, false, {
              message: "With This email user doesn't exists",
            });
          }
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.use(
  "voter-local",
  new LocalStrategy(
    {
      usernameField: "voterId",
      passwordField: "password",
    },
    (username, password, done) => {
      Voter.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          // console.log(user.email);
          if (user) {
            const bool = await bcrypt.compare(password, user.password);
            if (bool) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Invalid password",
              });
            }
          } else {
            return done(null, false, {
              message: "With This ID voter doesn't exists",
            });
          }
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(user);
  console.log("Serialize the user with Id : ", user.id);
  console.log("role", user.role);
  done(null, { id: user.id, role: user.role });
});

passport.deserializeUser((id, done) => {
  if (id.role == "admin") {
    Admin.findByPk(id.id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  } else {
    console.log("role :", id.role);
    Voter.findByPk(id.id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  }
});

//flash
const flash = require("connect-flash");
app.set("views", path.join(__dirname, "views"));
app.use(flash());

// for the flash
app.use(function (req, res, next) {
  const data = req.flash();
  res.locals.messages = data;
  next();
});

app.get("/", async (req, res) => {
  console.log(req.session.passport);
  if (req.session.passport) {
    res.redirect("/listOfElection");
  } else {
    res.render("index", {
      title: "Online Voting App",
      csrfToken: req.csrfToken(),
    });
  }
});

// election end points
app.get(
  "/listOfElection",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log(req.user);
    const ele = await Election.getElection(req.user.id);

    res.render("election", {
      ele,
      admin: req.user,
      csrfToken: req.csrfToken(),
    });
  }
);

app.post(
  "/addquetion/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log(req.body);
    console.log(req.params.id);

    if (req.body.title.trim().length <= 5) {
      req.flash("error", "Title length must grater than 5");
      return res.redirect(`/election/${req.params.id}/addQuetion`);
    }
    if (req.body.desc.length === 0) {
      req.flash("error", "Description Cann't be empty..");
      return res.redirect(`/election/${req.params.id}/addQuetion`);
    }
    if (req.body.desc.length <= 15) {
      req.flash("error", "Description length must grater than 15");
      return res.redirect(`/election/${req.params.id}/addQuetion`);
    }
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
  }
);

app.post("/election", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log(req.body);
  if (req.body.title.trim().length < 5) {
    req.flash("error", "election name length must grater than 5");
    return res.redirect("/listOfElection");
  }
  if (req.body.url.length === 0) {
    req.flash("error", "Url Cann't be empty..");
    return res.redirect("/listOfElection");
  }
  try {
    await Election.addElection({
      title: req.body.title,
      url: req.body.url,
      adminId: req.user.id,
    });
    res.redirect("/listOfElection");
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.get(
  "/election/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
  }
);

app.get(
  "/election/:id/addQuetion",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log(req.params.id);
    try {
      const election = await Election.findByPk(req.params.id);

      if (election.launch) {
        req.flash("error", "ELection is live so ypu cann't chnage ballot");
        return res.redirect(`/election/${election.id}`);
      }

      const que = await Quetion.getQuetions(req.params.id);
      res.render("quetion", {
        election,
        que,
        csrfToken: req.csrfToken(),
      });
    } catch (err) {
      console.log(err);
      return res.status(422).json(err);
    }
  }
);

app.get(
  "/election/:eId/quetion/:qId/addOptions",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const election = await Election.findByPk(req.params.eId);
    const quetion = await Quetion.findByPk(req.params.qId);
    const Options = await Option.getOptions(req.params.qId);
    return res.render("options", {
      Options,
      quetion,
      election,
      csrfToken: req.csrfToken(),
    });
  }
);

app.post(
  "/election/:eId/quetion/:qId/addOptions",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    if (req.body.name.length === 0) {
      req.flash("error", "Option value cann't be empty !!!");
      return res.redirect(
        `/election/${req.params.eId}/quetion/${req.params.qId}/addOptions`
      );
    }
    try {
      await Option.addOption({
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
  }
);

app.delete(
  "/delElection/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const election = await Election.findByPk(req.params.id);
    if (election.launch === false) {
      console.log("We are delete a election with ID: ", req.params.id);
      try {
        const affectedRow = await Election.remove(req.params.id, req.user.id);
        res.send(affectedRow ? true : false);
      } catch (error) {
        console.log(error);
        return res.status(422).json(error);
      }
    } else {
      req.flash("error", "Election is live so you cann't delete it");
      return res.redirect(`/listOfElection`);
    }
  }
);

app.delete(
  "/election/:eid/delQuetion/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("We are delete a quetion with ID: ", req.params.id);
    try {
      const affectedRow = await Quetion.remove(req.params.id);
      res.send(affectedRow ? true : false);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);

app.delete(
  "/election/:eid/delOption/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("We are delete a option with ID: ", req.params.id);
    try {
      const affectedRow = await Option.remove(req.params.id);
      res.send(affectedRow ? true : false);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);

app.post(
  "/modify/election/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      await Election.updateElection({
        id: req.params.id,
        title: req.body.title,
        url: req.body.url,
        adminId: req.user.id,
      });
      res.redirect("/listOfElection");
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);

app.post(
  "/modify/:eid/quetion/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      await Quetion.updateQuetion({
        id: req.params.id,
        title: req.body.title,
        description: req.body.desc,
      });
      res.redirect(`/election/${req.params.eid}/addQuetion`);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);

app.post(
  "/election/:eId/quetion/:qId/modifyOptions/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const election = await Election.findByPk(req.params.eId);
    if (election.launch === false) {
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
    } else {
      req.flash("error", "Election is live so you cann't modify ballot");
      return res.redirect(`/election/${req.params.eId}`);
    }
  }
);

app.get(
  "/election/:eid/preview",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
  }
);

app.get(
  "/election/:eid/voter",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const voters = await Voter.getVoters(req.params.eid);
    res.render("voter", {
      electionID: req.params.eid,
      voters,
      csrfToken: req.csrfToken(),
    });
  }
);

app.post(
  "/election/:eid/addvoter",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    if (req.body.voterId.trim().length < 3) {
      req.flash("error", "Voter ID must grater than 2!!");
      return res.redirect(`/election/${req.params.eid}/voter`);
    }
    if (req.body.password.length === 0) {
      req.flash("error", "Password can not be empty !!");
      return res.redirect(`/election/${req.params.eid}/voter`);
    }
    if (req.body.password.length <= 5) {
      req.flash("error", "Password must grater than 5 !!");
      return res.redirect(`/election/${req.params.eid}/voter`);
    }

    const pwd = await bcrypt.hash(req.body.password, saltRound);
    try {
      await Voter.addVoter({
        voterId: req.body.voterId,
        password: pwd,
        electionId: req.params.eid,
      });

      res.redirect(`/election/${req.params.eid}/voter`);
    } catch (error) {
      if (error.name == "SequelizeUniqueConstraintError") {
        error.errors.forEach((e) => {
          if (e.message == "voterId must be unique") {
            req.flash("error", "Voter with this VoterId already exists");
          }
        });
        return res.redirect(`/election/${req.params.eid}/voter`);
      } else {
        console.log(error);
        return res.status(422).json(error);
      }
    }
  }
);

app.delete(
  "/delVoter/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("We are delete a Voter with ID: ", req.params.id);
    try {
      const affectedRow = await Voter.remove(req.params.id);
      res.send(affectedRow ? true : false);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);

app.post(
  "/election/:eid/modify/voter/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const voter = await Voter.findByPk(req.params.id);
      voter.updateVoter(req.body.pwd);

      res.redirect(`/election/${req.params.eid}/voter`);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);

app.get(
  "/election/:eid/launch",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const election = await Election.findByPk(req.params.eid);
    const quetions = await Quetion.getQuetions(req.params.eid);
    const voters = await Voter.getVoters(req.params.eid);

    if (quetions.length < 2) {
      req.flash("error", "Add A more than two quetion in ballot for launch");
      return res.redirect(`/election/${req.params.eid}`);
    }
    if (voters.length < 3) {
      req.flash("error", "Election must contain more than 2 voter!!");
      return res.redirect(`/election/${req.params.eid}`);
    }

    let bool = false;

    const options = [];

    for (let i = 0; i < quetions.length; i++) {
      const op = await Option.getOptions(quetions[i].id);
      options.push(op);
    }

    for (let i = 0; i < options.length; i++) {
      if (options[i].length < 2) {
        console.log("length : ", options[i].length);
        console.log("options array :", options[i]);
        console.log("i = ", i);
        bool = true;
      }
    }

    if (bool) {
      req.flash(
        "error",
        "Each quetion in ballot must contain more than one option !!"
      );
      return res.redirect(`/election/${req.params.eid}`);
    }

    try {
      console.log(election);
      const ele = await election.launchElection();
      console.log(ele);
      console.log("Helo");
      res.redirect(`/election/${req.params.eid}`);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  }
);

app.get(
  "/election/:eid/end",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const election = await Election.findByPk(req.params.eid);
    if (election.launch) {
      try {
        await election.endElection();
        return res.redirect(`/election/${req.params.eid}`);
      } catch (error) {
        console.log(error);
        return res.status(422).json(error);
      }
    } else {
      req.flash("error", "Election is not live yet!! so cann't end election");
      return res.redirect(`/election/${req.params.eid}`);
    }
  }
);

app.get("/launch/:url", async (req, res) => {
  const election = await Election.findElectionByUrl(req.params.url);
  console.log(election);
  res.render("voterlogin", {
    election,
    csrfToken: req.csrfToken(),
  });
});

// app.post(
//   "/sessionVoter/:url",
//   passport.authenticate("voter-local", {
//     failureRedirect: `/listOfElection`,
//     failureFlash: true,
//   }),
//   (req, res) => {
//     console.log(req.user);
//     res.redirect(`/`);
//   }
// );

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

app.post(
  "/session",
  passport.authenticate("user-local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    console.log(req.user);
    res.redirect("/listOfElection");
  }
);

app.post("/users", async (req, res) => {
  console.log("Body : ", req.body.firstName);
  const pwd = await bcrypt.hash(req.body.password, saltRound);
  try {
    const user = await Admin.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: "admin",
      password: pwd,
    });

    req.logIn(user, (err) => {
      if (err) {
        console.log(err);
      }
      return res.redirect("/listOfElection");
    });
  } catch (error) {
    console.log(error);
    console.log(error.name);
    if (error.name == "SequelizeValidationError") {
      error.errors.forEach((e) => {
        if (e.message == "Please provide a firstName") {
          req.flash("error", "Please provide a firstName");
        }
        if (e.message == "Please provide email_id") {
          req.flash("error", "Please provide email_id");
        }
      });
      return res.redirect("/signup");
    } else if (error.name == "SequelizeUniqueConstraintError") {
      error.errors.forEach((e) => {
        if (e.message == "email must be unique") {
          req.flash("error", "User with this email already exists");
        }
      });
      return res.redirect("/signup");
    } else {
      return res.status(422).json(error);
    }
  }
});

module.exports = app;
