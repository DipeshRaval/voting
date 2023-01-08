/* eslint-disable no-undef */
const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
let server;
let agent;

function getCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

// eslint-disable-next-line no-unused-vars
async function login(agent, username, password) {
  let res = await agent.get("/login");
  var csrfToken = getCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
}

describe("Test case for database", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(process.env.PORT || 5000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign Up", async () => {
    var res = await agent.get("/signup");
    var csrfToken = getCsrfToken(res);
    const response = await agent.post("/users").send({
      firstName: "Dipu",
      lastName: "rvl",
      email: "dipu@gmail.com",
      password: "dipu",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("sign out", async () => {
    var res = await agent.get("/listofElection");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/listofElection");
    expect(res.statusCode).toBe(302);
  });

  test("Creates a Election", async () => {
    var agent = request.agent(server);
    await login(agent, "dipu@gmail.com", "dipu");
    var res = await agent.get("/listofElection");
    var csrfToken = getCsrfToken(res);
    const response = await agent.post("/election").send({
      title: "Class Monitor 2023",
      url: "monitor",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Creates a Quetion", async () => {
    var agent = request.agent(server);
    await login(agent, "dipu@gmail.com", "dipu");
    var res = await agent.get("/listofElection");
    var csrfToken = getCsrfToken(res);
    await agent.post("/election").send({
      title: "HOD Selection",
      url: "hod",
      _csrf: csrfToken,
    });

    const elections = await agent
      .get("/listofElection")
      .set("Accept", "application/json");
    const parseElections = JSON.parse(elections.text);
    const election = parseElections.ele[parseElections.ele.length - 1];

    res = await agent
      .get(`/election/${election.id}/addQuetion`)
      .set("Accept", "application/json");
    var quetions = JSON.parse(res.text);
    const totalQuetions = quetions.que.length;

    res = await agent.get(`/election/${election.id}/addQuetion`);
    csrfToken = getCsrfToken(res);

    await agent.post(`/addquetion/${election.id}`).send({
      title: "Name of hods",
      desc: "add a multiple hod option so the voter can vote on it.",
      _csrf: csrfToken,
    });

    res = await agent
      .get(`/election/${election.id}/addQuetion`)
      .set("Accept", "application/json");

    quetions = JSON.parse(res.text);
    expect(quetions.que.length).toBe(totalQuetions + 1);
  });

  test("delete a Quetion", async () => {
    var agent = request.agent(server);
    await login(agent, "dipu@gmail.com", "dipu");

    const elections = await agent
      .get("/listofElection")
      .set("Accept", "application/json");
    const parseElections = JSON.parse(elections.text);
    const election = parseElections.ele[parseElections.ele.length - 1];

    var res = await agent.get(`/election/${election.id}/addQuetion`);
    var csrfToken = getCsrfToken(res);

    await agent.post(`/addquetion/${election.id}`).send({
      title: "Name of Candidates",
      desc: "add a multiple hod option so the voter can vote on it.",
      _csrf: csrfToken,
    });

    res = await agent
      .get(`/election/${election.id}/addQuetion`)
      .set("Accept", "application/json");

    var quetions = JSON.parse(res.text);
    const que = quetions.que[quetions.que.length - 1];

    res = await agent.get(`/election/${election.id}/addQuetion`);
    csrfToken = getCsrfToken(res);

    const rese = await agent
      .delete(`/election/${election.id}/delQuetion/${que.id}`)
      .send({ _csrf: csrfToken });

    const bool = Boolean(rese.text);
    expect(bool).toBe(true);
  });

  test("Creates a Options", async () => {
    var agent = request.agent(server);
    await login(agent, "dipu@gmail.com", "dipu");

    const elections = await agent
      .get("/listofElection")
      .set("Accept", "application/json");
    const parseElections = JSON.parse(elections.text);
    const election = parseElections.ele[parseElections.ele.length - 1];

    res = await agent
      .get(`/election/${election.id}/addQuetion`)
      .set("Accept", "application/json");
    var quetions = JSON.parse(res.text);
    const totalQuetions = quetions.que.length;
    const que = quetions.que[totalQuetions - 1];

    res = await agent
      .get(`/election/${election.id}/quetion/${que.id}/addOptions`)
      .set("Accept", "application/json");
    var csrfToken = getCsrfToken(res);
    var resParse = JSON.parse(res.text);
    const totalOptions = resParse.Options.length;

    res = await agent.get(
      `/election/${election.id}/quetion/${que.id}/addOptions`
    );
    csrfToken = getCsrfToken(res);

    await agent
      .post(`/election/${election.id}/quetion/${que.id}/addOptions`)
      .send({
        name: "Dipesh",
        qid: que.id,
        _csrf: csrfToken,
      });

    res = await agent
      .get(`/election/${election.id}/quetion/${que.id}/addOptions`)
      .set("Accept", "application/json");

    resParse = JSON.parse(res.text);
    expect(resParse.Options.length).toBe(totalOptions + 1);
  });

  test("Delete a Options", async () => {
    var agent = request.agent(server);
    await login(agent, "dipu@gmail.com", "dipu");

    const elections = await agent
      .get("/listofElection")
      .set("Accept", "application/json");
    const parseElections = JSON.parse(elections.text);
    const election = parseElections.ele[parseElections.ele.length - 1];

    var res = await agent
      .get(`/election/${election.id}/addQuetion`)
      .set("Accept", "application/json");
    var quetions = JSON.parse(res.text);
    const totalQuetions = quetions.que.length;
    const que = quetions.que[totalQuetions - 1];

    res = await agent.get(
      `/election/${election.id}/quetion/${que.id}/addOptions`
    );
    var csrfToken = getCsrfToken(res);

    await agent
      .post(`/election/${election.id}/quetion/${que.id}/addOptions`)
      .send({
        name: "Delete OPtion",
        qid: que.id,
        _csrf: csrfToken,
      });

    res = await agent
      .get(`/election/${election.id}/quetion/${que.id}/addOptions`)
      .set("Accept", "application/json");
    resParse = JSON.parse(res.text);
    const option = resParse.Options[resParse.Options.length - 1];

    res = await agent.get(
      `/election/${election.id}/quetion/${que.id}/addOptions`
    );
    csrfToken = getCsrfToken(res);

    const rese = await agent
      .delete(`/election/${election.id}/delOption/${option.id}`)
      .send({ _csrf: csrfToken });

    const bool = Boolean(rese.text);
    expect(bool).toBe(true);
  });

  test("should be add a voter in a elction", async () => {
    var agent = request.agent(server);
    await login(agent, "dipu@gmail.com", "dipu");

    const elections = await agent
      .get("/listofElection")
      .set("Accept", "application/json");
    const parseElections = JSON.parse(elections.text);
    const election = parseElections.ele[parseElections.ele.length - 1];

    res = await agent
      .get(`/election/${election.id}/voter`)
      .set("Accept", "application/json");
    var resParse = JSON.parse(res.text);
    const totalVoter = resParse.voters.length;

    res = await agent.get(`/election/${election.id}/voter`);
    var csrfToken = getCsrfToken(res);

    await agent.post(`/election/${election.id}/addvoter`).send({
      voterId: "VgK123",
      password: "12345678",
      _csrf: csrfToken,
    });

    res = await agent
      .get(`/election/${election.id}/voter`)
      .set("Accept", "application/json");
    resParse = JSON.parse(res.text);

    expect(resParse.voters.length).toBe(totalVoter + 1);
  });
});
