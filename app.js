require("dotenv").config();
const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");
const figlet = require("figlet");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3005;

//set up express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const connection = mysql.createConnection({
  host: "127.0.0.1",
  //   port: PORT,
  user: "root",
  password: "",
  database: "employee_DB",
});

// Connect to the DB
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  figlet("Employee tracker", function (err, data) {
    if (err) {
      console.log("art not loaded");
    } else {
      console.log(data);
    }
    startPrompt();
  });
});

//start function prompt
function startPrompt() {
  const startQuestions = [
    {
      type: "list",
      name: "action",
      message: "what would you like to do?",
      loop: false,
      choices: [
        "View all employees",
        "View all roles",
        "View all departments",
        "add an employee",
        "add a role",
        "add a department",
        "update role for an employee",
        "update employee's manager",
        "view employees by manager",
        "delete a department",
        "delete a role",
        "delete an employee",
        "View the total utilized budget of a department",
        "quit",
      ],
    },
  ];

  inquirer
    .prompt(startQuestions)
    .then((response) => {
      switch (response.action) {
        case "View all employees":
          viewAll("EMPLOYEE");
          break;
        case "View all roles":
          viewAll("ROLE");
          break;
        case "View all departments":
          viewAll("DEPARTMENT");
          break;
        default:
          connection.end();
      }
    })
    .catch((err) => {
      console.error(err);
    });
}
const viewAll = (table) => {
  // const query = `SELECT * FROM ${table}`;
  let query;
  if (table === "DEPARTMENT") {
    query = `SELECT * FROM DEPARTMENT`;
  } else if (table === "ROLE") {
    query = `SELECT R.id AS id, title, salary, D.name AS department
      FROM ROLE AS R LEFT JOIN DEPARTMENT AS D
      ON R.department_id = D.id;`;
  } else {
    //employee
    query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
      R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
      FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
      LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
      LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id;`;
  }
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);

    startPrompt();
  });
};
