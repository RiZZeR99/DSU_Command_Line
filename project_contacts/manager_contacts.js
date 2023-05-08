// load environment
require("../opendsu-sdk/psknode/bundles/openDSU");

const { writeFile, readFile } = require("fs");
// load SDK
const opendsu = require("opendsu");

// load libraries
const resolver = opendsu.loadApi("resolver");
const keyssispace = opendsu.loadApi("keyssi");

const ssiOnPassword = keyssispace.createTemplateSeedSSI('default');


const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const readLineSync = require('readline-sync');


function add(dsu, name, email, phoneNumber, address) {
    console.log("Format:");
    console.log("------------------------------------------------");
    console.log("name    |    mail    |    phone     |    address");
    dsu.writeFile(name, JSON.stringify({ name, email, phoneNumber, address }), (err) => {
        if (err) {
            console.log("Error: " + err);
        }
    });
}



function list(dsu) {
    dsu.readDir("/", { recursive: true }, (err, files) => {
        if (err) {
            console.error("Error listing contacts: " + err);
        } else {
            console.log(`Listing directory file contents:\n${files.join('\n')}`);
        }
    });
}


async function readContact(dsuInstance, name) {
    let listFiles = await $$.promisify(dsuInstance.listFiles, dsuInstance)("/");
    if (listFiles.includes(name)) {
        dsuInstance.readFile(name, (err, res) => {
            if (err) {
                console.log("Error while reading data for contact " + name + ": " + err);
            }
            else {
                console.table(JSON.parse(res.toString()));
            }
        });
    }
    else {
        console.log("No contact " + name + " found in the DSU");
    }
}

async function remove(dsuInstance, name) {
    let listFiles = await $$.promisify(dsuInstance.listFiles, dsuInstance)("/");
    if (listFiles.includes(name)) {
        dsuInstance.delete(name, {}, (err) => {
            if (err) {
                console.log("Couldn't delete. Error: " + err);
            }
            else {
                console.log("Deleted");
            }
        });
    }
    else {
        console.log("No contact with name " + name + " to delete");
    }
}

async function exportData(dsuInstance) {
    let listContacts = [];
    let listFiles = await $$.promisify(dsuInstance.listFiles, dsuInstance)("/");

    for (let index = 0; index < listFiles.length; index++) {
        let fileContact = listFiles[index];
        if (fileContact != "dsu-metadata-log") {
            let contact = await $$.promisify(dsuInstance.readFile, dsuInstance)(fileContact)
                .catch(err => {
                    console.log("Error exporting data! " + err);
                });
            listContacts.push(JSON.parse(contact));
        }
    }

    // console.log(listContacts);

    let fileName = Date.now();

    writeFile("./" + fileName, JSON.stringify(listContacts, null, 4), (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Written contacts at file " + fileName);
        }
    });
}

async function parseJsonImport(dsuInstance, jsonData) {
    json = jsonData;
    if (jsonData.startsWith("file://")) {
        json = await $$.promisify(readFile)(jsonData.replace("file://", ""))
            .catch(err => {
                console.log("Error: " + err);
            });
    }
    await importData(dsuInstance, json);
}

async function importData(dsuInstance, jsonData) {
    console.log("Received json: " + jsonData);

    try {
        const listContacts = JSON.parse(jsonData);
        console.log("contacts: " + listContacts);
        let listFiles = await $$.promisify(dsuInstance.listFiles, dsuInstance)("/");

        for (let index = 0; index < listContacts.length; index++) {
            contact = listContacts[index];
            if (listFiles.includes(contact)) {
                updateData(dsuInstance, contact.name, contact.mail, contact.phoneNumber, contact.address);
            }
            else {
                add(dsuInstance, contact.name, contact.emai, contact.phoneNumber, contact.address);
            }
        }

    }
    catch (exception) {
        console.log("Problem when extracting data from JSON: " + exception);
    }
}

async function updateData(dsuInstance, name, mail, phoneNumber, address) {
    let listFiles = await $$.promisify(dsuInstance.listFiles, dsuInstance)("/");
    if (listFiles.includes(name)) {
        remove(dsuInstance, name);
        add(dsuInstance, name, mail, phoneNumber, address);
    }
    else {
        console.log("There is no file with name " + name);
    }
}

function runSession(dsuInstance) {
    command = readline.question("Command ", input => {
        const command = input.trim().split(' ');
        // console.log(command);
        if (command.length == 0) {
            console.log("No command given");
        }
        else {
            switch (command[0]) {
                case 'add':
                    if (command.length != 5) {
                        console.log("Invalid number of arguments: The arguments for 'add' command are the following: <name> <email> <phone_number> <address>")
                    }
                    else {
                        add(dsuInstance, command[1], command[2], command[3], command[4]);
                    }
                    break;
                case 'list':
                    list(dsuInstance);
                    break;
                case 'read':
                    if (command.length != 2) {
                        console.log("Invalid number of arguments: The arguments for 'read' command are the following: <name>")
                    }
                    else {
                        readContact(dsuInstance, command[1]);
                    }
                    break;
                case 'delete':
                    if (command.length != 2) {
                        console.log("Invalid number of arguments: The arguments for 'delete' command are the following: <name>")
                    }
                    else {
                        remove(dsuInstance, command[1]);
                    }
                    break;
                case 'update':
                    if (command.length != 5) {
                        console.log("Invalid number of arguments: The arguments for 'update' command are the following: <name> <email> <phone_number> <address>")
                    }
                    else {
                        updateData(dsuInstance, command[1], command[2], command[3], command[4]);
                    }
                    break;
                case 'export':
                    exportData(dsuInstance);
                    break;
                case 'import':
                    if (command.length != 2) {
                        console.log("Invalid number of arguments: The arguments for 'import' command are the following: file://<file_path> | <json_data>")
                    }
                    else {
                        parseJsonImport(dsuInstance, command[1]);
                    }
                    break;
                case 'exit':
                    process.exit(0);
            }
        }
        runSession(dsuInstance);
    })
}

resolver.createDSU(ssiOnPassword, (err, dsuInstance) => {
    if (err) {
        throw err;
    }
    runSession(dsuInstance);
});
