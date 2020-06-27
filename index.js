const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

// create connection to employee database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "admin",
    database: "employee_tracker"
});

// connect and start main program
connection.connect(err => {
    if (err) throw err;
    employeeMenu();
})

// main program
async function main() {
    await getEmployees();
    console.table(test);

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
    connection.query(
        `SELECT employees.first_name AS First_Name, employees.last_name AS Last_Name, roles.title AS Role, departments.name AS Department, roles.salary As Salary, CONCAT(managers.first_name, " ", managers.last_name) AS Manager FROM employees
        LEFT JOIN roles ON employees.role_id = roles.id
        LEFT JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees AS managers ON employees.manager_id = managers.id`,
        function (err, res) {
            if (err) throw err;
            console.log("Employees:");
            console.table(res);
            employeeMenu();
        })
}

async function viewEmployeesByManager() {
    connection.query(
        `SELECT CONCAT(employees.first_name, " ", employees.last_name) AS manager, employees.id AS id FROM employees
        INNER JOIN employees AS underling ON employees.id = underling.manager_id;`,
        async function (err, res) {
            if (err) throw err;
            const managers = [...new Set(res.map(a => a.manager))];
            
            const response = await inquirer.prompt({
                type: "list",
                name: "manager",
                message: "Select a manager to view their employees.",
                choices: managers
            })

            const index = managers.indexOf(response.manager);

            connection.query(
                `SELECT employees.first_name AS First_Name, employees.last_name AS Last_Name, roles.title AS Role, departments.name AS Department, roles.salary As Salary, CONCAT(managers.first_name, " ", managers.last_name) AS Manager FROM employees
                LEFT JOIN roles ON employees.role_id = roles.id
                LEFT JOIN departments ON roles.department_id = departments.id
                LEFT JOIN employees AS managers ON employees.manager_id = managers.id
                WHERE employees.manager_id = ${res[index].id}`,
                function (err2, res2) {
                    if (err2) throw err2;
                    console.log(`Employees managed by ${response.manager}:`)
                    console.table(res2);
                    employeeMenu();
                })
        });
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

// Role Menu Functions -------------------------------------------------- ||
async function roleMenu() {
    const response = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["View Roles", "Add Role", "Delete Role", "Go Back"]
    })

    switch (response.action) {
        case "View Roles":
            viewRoles();
            break;
        case "Add Role":
            addRole();
            break;
        case "Delete Role":
            deleteRole();
            break;
        default:
            main();
            break;
    }

}

function viewRoles() {
    connection.query("SELECT roles.title AS Role, departments.name AS Department FROM roles LEFT JOIN departments on roles.department_id = departments.id;", function (err, res) {
        console.table(res);
        roleMenu();
    });
}

function addRole() {
    connection.query("SELECT * FROM departments", async function (err, res) {
        if (err) throw err;
        const departments = res.map(a => a.name);

        const response = await inquirer.prompt([{
            type: "list",
            name: "department",
            message: "Which department is this role in?",
            choices: departments
        },
        {
            type: "input",
            name: "role",
            message: "What would you like to name the new role?"
        },
        {
            type: "input",
            name: "salary",
            message: "What is this role's salary?"
        }
        ])

        const index = departments.indexOf(response.department);

        connection.query(`INSERT INTO roles (title, salary, department_id) VALUES ('${response.role}', '${response.salary}', '${res[index].id}');`, function (err2, res2) {
            if (err2) throw err2;
            console.log(`${response.role} Role has been successfully created.`);
            roleMenu();
        })
    });
}

async function deleteRole() {
    connection.query("SELECT * FROM roles", async function (err, res) {
        if (err) throw err;
        const roles = res.map(a => a.title);

        const response = await inquirer.prompt({
            type: "list",
            name: "role",
            message: "Which role would you like to delete?",
            choices: roles
        })

        const index = roles.indexOf(response.role);

        connection.query(`DELETE FROM roles WHERE id = '${res[index].id}'`, function (err2, res2) {
            if (err2) throw err2;
            console.log(`${response.role} role was successfully deleted.`);
        });
    })
}

// Department Menu Functions ------------------------------------------- ||
async function departmentMenu() {
    const response = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["View Departments", "Add a Department", "Delete a Department", "Go Back"]
    })

    switch (response.action) {
        case "View Departments":
            viewDepartments();
            break;
        case "Add a Department":
            addDepartment();
            break;
        case "Delete a Department":
            deleteDepartment();
            break;
        default:
            main();
            break;
    }
}

function viewDepartments() {
    connection.query("SELECT name AS Departments FROM departments;", function (err, res) {
        console.table(res);
        departmentMenu();
    })
}

async function addDepartment() {
    const response = await inquirer.prompt({
        type: "input",
        name: "department",
        message: "What would you like to name the new department?"
    });

    if (response.department) {
        connection.query(`INSERT INTO departments (name) VALUES ('${response.department}');`, function (err, res) {
            if (err) throw err;
            console.log(`${response.department} Department successfully added`);
            departmentMenu();
        })
    }
    else {
        console.log("Please enter a name for the department");
        addDepartment();
    }
}

async function deleteDepartment() {
    connection.query("SELECT name FROM departments;", async function (err, res) {
        if (err) throw err;
        const departments = res.map(a => a.name);

        const response = await inquirer.prompt({
            type: "list",
            name: "department",
            message: "Which department would you like to delete?",
            choices: departments
        })

        connection.query(`DELETE FROM departments WHERE name = '${response.department}';`, function (err2, res2) {
            if (err2) throw err2;
            console.log("Department successfully deleted.")
            departmentMenu();
        })
    })
}