import db from './db.js';

console.log("Checking Database Content...\n");

// We nest the calls to ensure they print in order
db.all("SELECT * FROM users", [], (err, users) => {
    if (err) {
        console.error("Error fetching users:", err);
    } else {
        console.log("--- USERS TABLE ---");
        // console.table gives a nice formatted output in the terminal
        console.table(users);
    }

    db.all("SELECT * FROM works", [], (err, works) => {
        if (err) {
            console.error("Error fetching works:", err);
        } else {
            console.log("\n--- WORKS TABLE ---");
            console.table(works);
        }

        // Give it a moment to finish any pending operations then exit
        setTimeout(() => process.exit(0), 500);
    });
});
