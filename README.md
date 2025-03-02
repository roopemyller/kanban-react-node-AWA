# Kanban Board Project Documentation - Roope Myller

This is a course project for the Advanced Web Application CT30A3204 course. The task was to implement a system where a registered and logged in user can add columns and tickets to a kanban board.

## Installation and setup

### 1. Clone the repository
```
git clone https://github.com/roopemyller/kanban-react-node-AWA.git
cd kanban-react-node-AWA
```

### 2. Install depedencies

Use of pnpm packet manager is recommended.

#### Backend
```
cd server
pnpm install
```

#### Frontend
```
cd client
pnpm install
```
#### MongoDB

This project uses MongoDB as its database. Make sure that you have MongoDB installed in your system. Official MongoDB installation guide [here.](https://www.mongodb.com/docs/manual/installation/)

### 3. Start development servers

Backend and Frontend need to be started in two different terminals.

#### Backend (Port 3000)
```
cd server
pnpm start
```
#### Frontend (Port 5173)
```
cd client
pnpm run dev
```
**NOTE!** After running `pnpm run dev` there might come a client side Error about "An error occurred while trying to read the map file at quill.sno.css.map". This error can be dismissed.

## Tech Stack

### Frontend
* React - Vite (TypeScript)
* Material UI

### Backend
* Node.js with Express
* Typescript
* MongoDB

## Features

To get the minimun 25/50 points for the project the mandatory requirements. Below are the requiremnets and about some of them how I have implemented them.
* Implementation of backend with Node.js using Express
* Utilization of db (MongoDB)
* User authentication
    * Register and Login and Logout
    * JWT authorization
* Kanban Board - Authenticated users can:
    * Add/remove/rename columns to/of their own board
    * Add/move/remove tickets on/of their own board
    * Tickets should be movable to both up and down and between columns
* Responsive design for mobile and desktop
    * Material UI
    * @media queries
* Documentation

### Additional Feature Table

| Feature Description | Points |
| ----------- | ----------- |
| Basic Features | 25 |
| Utilization of a frontside framework (React) | 3 |
| Tickets can be reordered with drag and drop ([dnd-kit](https://dndkit.com/)) | 2 |
| Columns can be reordered with drag and drop (dnd-kit) | 2 |
| User can set the color of a column and ticket | 2 |
| Tickets have a visible timestamps when they have been created and modified | 3 |
| Ticket description uses rich text editor ([react-quill-new](https://www.npmjs.com/package/react-quill-new)) | 2 |
| A search bar is provided to filter out only those cars that have the searched keyword | 3 |
| User has the option just to double click any editable content (board title, column title, ticket) to edit it | 3 
| Board title is editable | 1 |
| User can have a profile picture ([mutler](https://www.npmjs.com/package/multer)) | 2 |
| Users profile picture and name can be edited through profile settings (mutler) | 2 |
| **Total** | **50** |

## User Manual

### Sign up & Login

New users can sign up and create a user on sign up page. User must input their `name`, `email` and create a `password`. Email must be in email format.
Password must be at least 8 characters long, with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (#!&?)

### Kanban Board

After login user is redirected to home page where authenticated user can see text "Hello [user name]" and an option to create a Kanban board. Give the Kanban board a descriptive name and hit "Create Board" button. After that a fresh empty Kanban Board will appear.

In the board header we can see the main tools of using the Kanban Board. 
* Search Tickets
    * With the search field in the middle, user can search tickets from the board that contain the given keyword. With
* Add Ticket Button
    * With the Add Ticket Button user can add a new ticket to a column
* Add Column Button
    * With the Add Column Button user can add a new column to the board

### Adding a column

Adding a column should be the first thing to do after creating a board. Give the Column a descriptive title and select a color for its background and hit Add

### Adding a ticket

Give the ticket a title and description. When giving the description user can use the Rich Text editor. Select Column from available column list and then select the ticket background color. After that hit add.

Congrats you now have your first column and ticket created!

### Editing contents

User can edit the following contents in their kanban board:
* Board title
    * Double click the title to edit it
* Column title and color
    * Double click the title or select **Edit** from the three dots menu of the column 
* Ticket title, description and color
    * Double click the ticket or select **Edit** from the three dots menu of the ticket
 
Editing tickets will add a **Modified** time stamp to the bottom of the ticket. It will show the latest time that the ticket has been modified by changing it's title, description or color.

### Delete contents

User can delete the following contents in their kanban board:
* Columns
    * Select **Delete** from the three dots menu of the column 
* Tickets
    * Select **Delete** from the three dots menu of the ticket

### Reordering/Moving contents

User can move/reorder the following contents with drag and drop mechanics in their kanban board:
* Columns
* Tickets
    * Tickets can be moved inside the original parent column or between columns.
    * **NOTE!** When moving a ticket outside the original parent column, it will show as it snaps the ticket back to the column but if the user just holds the drag and releases it on top of other column, the ticket will move there. This is a bug and it has not been fixed yet....

### Profile Settings

User profile settings can be found from the top-right of the header. At the profile picture of user is empty. If user wants to add a profile picture or change their name, user can do that from profile settings by clicking the **Edit Profile**

## Declaration of AI usage

### Documentation

ChatGPT was used to get ideas to what parts should a good documentation include and in what order. I used this information for the base of this documentation/user manual.

AI tools were not used in any other way to create this document.

### Code

GitHub Copilot (ChatGPT) and ChatGPT was used for
* Implementation ideas for different features
* Example code generation and autocompletion
* Troubleshooting bugs
* Clarification of some functionalities

All AI-generated content was reviewed and edited/refactored to ensure functionality, correctness and originality.
