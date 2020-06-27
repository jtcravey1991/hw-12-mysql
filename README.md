# hw-12-mysql
Homework Week 12: MySQL Employee Tracker

## Description

This week's homework was to utilize node and its packages to create a command line application for managing a company's departments, roles and employees. Important node packages included inquirer, mysql and console.table.  Using MySQL Workbench, we created a database to hold employees, roles and deparmtents, which we were able to access and modify using the mysql node package.

## Usage

To use the app, the user runs the command npm start in the terminal while accessing the application's root directory. You will be presented with three menu options for eployees management, roles management and department management. In the roles and department menus you can view, add and delete roles and deparments. In the employee menu you can do the same functions with employees but also find employees by manager. Here is a gif of these functionalities being used:

![a user using the applications various functionalities](/images/runningapp.gif)

## Code

The new code this week was using the MySQL language to add, modify or delete data inside a database, as well as creating it. Here is a sample of code which created our tables within our database. Note the use of primary and foriegn keys to designate unique id's and links to other tables' uniqe ids.

![a snipped of code creating tables using MySQL](/images/dbtables.JPG)