const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table")

// create connection to employee database
// var connection = mysql.createConnection({
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: "admin",
//     database: ""
// });

// connect and start main program
// connection.connect(err => {
//     if (err) throw err;
//     main();
// })

main();

// main program
async function main() {
    const response = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "Select a menu:",
        choices: ["Employee Menu", "Roles Menu", "Departments Menu"]
    })

    switch (response.action) {
        case "Employee Menu":
            employeeMenu()
            break;
        case "Roles Menu":
            roleMenu();
            break;
        case "Departments Menu":
            departmentMenu();
            break;
    }
}

// Global Functions ---------------------------------------------------------------------------------- ||
function getEmployees() {
    
}

// Employee Menu Funtions ---------------------------------------------------------------------------- ||
async function employeeMenu() {
    console.log()
    const response = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["View All Employees", "View Employees By Manager", "Add Employee", "Delete Employee", "Update Employee", "Go Back"]
    })

    switch (response.action) {
        case "View All Employees":
            viewAllEmployees();
            break;
        case "View Employees By Manager":
            viewEmployeesByManager();
            break;
        case "Add Employee":
            addEmployee();
            break;
        case "Delete Employee":
            deleteEmployee();
            break;
        case "Update Employee":
            updateEmployee();
            break;
        default:
            main();
            break;
    }
}

function viewAllEmployees() {

}

async function viewEmployeesByManager() {

}

async function addEmployee() {

}

async function deleteEmployee() {

}

async function updateEmployee() {
    const response = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to update?",
        choices: ["Employee Role", "Employee Manager", "Go Back"]
    })

    switch (response.action) {
        case "Employee Role":
            updateEmployeeRole();
            break;
        case "Employee Manager":
            updateEmployeeManager();
            break;
        default:
            employeeMenu();
            break;
    }
}

async function updateEmployeeRole() {

}

async function updateEmployeeManager() {

}

// Role 
async function roleMenu() {

}

async function departmentMenu() {

}