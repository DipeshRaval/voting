# Online Voting Platform

## Live app Link :point_down::point_down::point_down:

- Link -> https://online-voting-kcy6.onrender.com/

## Introduction

- This is an Online Voting Platform where admin can sign in,sign up and sign out. After sign up admin will redirect to election page where the admin can create a an Elections as well as admin can see the election which is create by admin.

- For add a elction we have to admin have to provide a elction title and a url on which later on eletion will launch.

- After create a election admin can create a ballot paper inside ballot paper admin can create a multiple quetion with multiple answer options. For add a quetion inside a ballot we have to provide small quetion title also long description. Admin can edit this ballot paper as well as they can delete a quetion from a ballot paper until election not live.

- After create a ballot paper admin can add a voter inside a election. For add a voter inside election we have to provide a Voter ID also a Password for voter.

- After adding a voter we can launch a election. When we launch an election then the election will live on public url on which the voter can vote it by provide a credentials.

- When election is launched at that time admin can not modify a ballot paper but it can add and a modify a voter list.

- when election is live admin can preview the result.

- After voting is finished admin can end a election when election is end the voter can see the result of an election on a public url.

## Run Locally

- Note : Postgresql service must install in your system.

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

# ScreenSorts

## Admin Side :
![Screenshot 2023-01-16 at 12 12 38 PM](https://user-images.githubusercontent.com/103437774/212616881-3b32fe6c-edfb-4e7b-bdae-3e0a50e603e1.png)
![Screenshot 2023-01-16 at 12 13 30 PM](https://user-images.githubusercontent.com/103437774/212616897-e8eccae4-2e31-40ed-b593-f442d4e31b7f.png)
![Screenshot 2023-01-16 at 12 13 54 PM](https://user-images.githubusercontent.com/103437774/212616927-9137c14e-6593-480c-8b87-30b8b8b07885.png)
![Screenshot 2023-01-16 at 12 14 12 PM](https://user-images.githubusercontent.com/103437774/212616950-700dcdb4-c5ad-455c-bd54-286a744a90b4.png)
![Sc![Screenshot 2023-01-16 at 12 16 01 PM](https://user-images.githubusercontent.com/103437774/212617009-774a9ab1-7a72-4ca0-aa7c-5f1d1f09fcc5.png)
![Screenshot 2023-01-16 at 12 16 06 PM](https://user-images.githubusercontent.com/103437774/212617118-c604c2b6-23c8-4f68-8c1f-0b3a35e5b7b0.png)
![Screenshot 2023-01-16 at 12 14 49 PM](https://user-images.githubusercontent.com/103437774/212617133-997b76c8-01c4-46d2-a98b-d3e50481f603.png)
![Screenshot 2023-01-16 at 12 14 30 PM](https://user-images.githubusercontent.com/103437774/212617146-097b7d41-8241-4422-bee6-6aeaaedad3b7.png)
![Screenshot 2023-01-16 at 12 14 42 PM](https://user-images.githubusercontent.com/103437774/212617169-c8d1a7ca-d601-43d7-8f85-2498524b8022.png)

# Client Side :
![Screenshot 2023-01-16 at 12 16 30 PM](https://user-images.githubusercontent.com/103437774/212617955-f7bfeed7-ffa7-44b3-9c35-038817fd0e16.png)
![Screenshot 2023-01-16 at 12 18 15 PM](https://user-images.githubusercontent.com/103437774/212618023-94e8f847-4483-46ab-9564-92c400d67306.png)
![Screenshot 2023-01-16 at 12 18 23 PM](https://user-images.githubusercontent.com/103437774/212618079-0da95483-950d-4924-845a-9b568f6841e0.png)
![Screenshot 2023-01-16 at 12 16 44 PM](https://user-images.githubusercontent.com/103437774/212617969-5050bd76-103e-4e4b-8435-16a43ccaf723.png)



