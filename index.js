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
    main();
})

// main program
async function main() {
    const response = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "Select a menu:",
        choices: ["Employee Menu", "Roles Menu", "Departments Menu", "Exit"]
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
        default:
            process.exit();
    }
}

// Employee Menu Funtions ---------------------------------------------------------------------------- ||
async function employeeMenu() {
    console.log()
    const response = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["View All Employees", "View Employees By Manager", "Add Employee", "Delete Employee", "Go Back"]
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

            let index = null;

            for (let i = 0; i < res.length; i++) {
                if (res[i].manager === response.manager) {
                    index = i;
                    break;
                }
            }

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
    connection.query(
        `SELECT * FROM departments ORDER BY id`,
        async function (err, rawDepartments) {
            if (err) throw err;
            const departments = rawDepartments.map(a => a.name);
            const responseDep = await inquirer.prompt({
                type: "list",
                name: "department",
                message: "Which department is this employee in?",
                choices: departments
            })
            dIndex = departments.indexOf(responseDep.department);
            connection.query(
                `SELECT * FROM roles WHERE department_id = ${rawDepartments[dIndex].id} ORDER BY id`,
                async function (err2, rawRoles) {
                    if (err2) throw err2;
                    const roles = rawRoles.map(a => a.title);
                    const responseRole = await inquirer.prompt({
                        type: "list",
                        name: "role",
                        message: "Select employee's role",
                        choices: roles
                    })
                    let rIndex = null;
                    for (let i = 0; i < rawRoles.length; i++) {
                        if (rawRoles[i].title === responseRole.role) {
                            rIndex = i;
                            break;
                        }
                    }
                    connection.query(
                        `SELECT CONCAT(first_name, " ", last_name) as name, id FROM employees ORDER BY id;`,
                        async function (err3, rawManagers) {
                            if (err3) throw err3;
                            const managers = ["none", ...rawManagers.map(a => a.name)];
                            const response = await inquirer.prompt([
                                {
                                    type: "list",
                                    name: "manager",
                                    message: "Select the employee's manager.",
                                    choices: managers
                                },
                                {
                                    type: "input",
                                    name: "first_name",
                                    message: "Enter the employees first name"
                                },
                                {
                                    type: "input",
                                    name: "last_name",
                                    message: "Enter the employees last name"
                                }
                            ])

                            let mIndex = null;
                            for (let i = 0; i < rawManagers.length; i++) {
                                if (rawManagers[i].name = response.manager) {
                                    mIndex = i;
                                }
                            }

                            let insert = `INSERT INTO employees(first_name, last_name, role_id`;
                            if (mIndex === null) {
                                insert += `)`
                            }
                            else {
                                insert += `, manager_id)`
                            }
                            let values = `VALUES ('${response.first_name}', '${response.last_name}', '${rawRoles[rIndex].id}'`
                            if (mIndex === null) {
                                values += `)`;
                            }
                            else {
                                values += `, '${rawManagers[mIndex].id}')`
                            }
                            const completeInsert = insert + ` ` + values;
                            connection.query(
                                completeInsert,
                                function(err4, res) {
                                    if (err4) throw err4;
                                    console.log(`${response.first_name} ${response.last_name} successfully added as an employee.`);
                                    employeeMenu();
                                }
                            )
                        }
                    )
                })
        })
}

async function deleteEmployee() {
    connection.query(`SELECT CONCAT(first_name, " ", last_name) as name, id FROM employees ORDER BY id`, async function (err, res) {
        if (err) throw err;
        const employees = res.map(a => a.name);

        const response = await inquirer.prompt({
            type: "list",
            name: "employee",
            message: "Which employee would you like to delete?",
            choices: employees
        })

        const index = employees.indexOf(response.employee);

        connection.query(`DELETE FROM employees WHERE id = '${res[index].id}'`, function (err2, res2) {
            if (err2) throw err2;
            console.log(`${response.employee} was successfully deleted.`);
            employeeMenu();
        });
    })
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
            roleMenu();
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