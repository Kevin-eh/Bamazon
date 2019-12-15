var mysql = require("mysql");
var inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) {
    throw err;
  }
  console.log("connected as id", connection.threadId);
  console.log(
    "Hail and well met traveler! We brew the finest potions here, probably too powerful for you."
  );
  connection.query("SELECT * FROM products ORDER BY item_id", function(
    err,
    result
  ) {
    if (err) throw err;

    console.table(result);
    start();

    function start() {
      inquirer
        .prompt([
          {
            name: "whatID",
            type: "number",
            message:
              "HMMM Looking to buy something? Perhaps you would like to tell me the ID of that which you would like to purchase, traveler."
          },
          {
            name: "howMany",
            type: "number",
            message:
              "MMMMMM an innnnnnteresting choice. Perhaps now you want to tell me HOW MANY of that you'd like?"
          }
        ])
        .then(function(answer) {
          var chosenItem;
          for (var i = 0; i < result.length; i++) {
            if (result[i].item_id === answer.whatID) {
              chosenItem = result[i];
              if (answer.howMany < chosenItem.stock_quantity) {
                var total = chosenItem.price * answer.howMany;
                var newStock = chosenItem.stock_quantity - answer.howMany;
                connection.query("UPDATE products SET ? WHERE ?", [
                  {
                    stock_quantity: newStock
                  },
                  {
                    item_id: chosenItem.item_id
                  }
                ]);

                console.log(
                  "mmmmm wonderful. I will take those " +
                    total +
                    " gold pieces. Enjoy your " +
                    chosenItem.product_name
                );
                connection.end();
              } else if (answer.howMany > chosenItem.stock_quantity) {
                console.log(
                  "RUFFIAN THATS TOO MANY. Traveler do you take me for a Fool? Leave my shop! At once! Begone with you!"
                );
                connection.end();
              }
              //   console.log(chosenItem);
            }
          }
        });
    }
  });
});
