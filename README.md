# Online Voting Platform

## Introduction

- This is an Online Voting Platform where admin can sign in,sign up and sign out. After sign up admin will redirect to election page where the admin can create a an Elections as well as admin can see the election which is create by admin.

- For add a elction we have to admin have to provide a elction title and a url on which later on eletion will launch.

- After create a election admin can create a ballot paper inside ballot paper admin can create a multiple quetion with multiple answer options. For add a quetion inside a ballot we have to provide small quetion title also long description. Admin can edit this ballot paper as well as they can delete a quetion from a ballot paper until election not live.

- After create a ballot paper admin can add a voter inside a election. For add a voter inside election we have to provide a Voter ID also a Password for voter.

- After adding a voter we can launch a election. When we launch an election then the election will live on public url on which the voter can vote it.

- When election is launched at that time admin can not modify a ballot paper but it can add and a modify a voter list.

- when election is live admin can preview the result.

- After voting is finished admin can end a election when election is end the voter can see the result of an election on a public url.

## Usage

- Install dependacies

```
npm install
```

- For create a database

```
npx sequlize-cli db:create
```

- For execute migration

```
npx sequelize-cli db:migrate
```

- Start Application

```
npm run start
```

- For run a test Case

```
npm test

```
