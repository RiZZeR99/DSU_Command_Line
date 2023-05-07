// load environment
require("../opendsu-sdk/psknode/bundles/openDSU");

const { write, writeFile, readFile } = require("fs");
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
            console.error(err);
        } else {
            console.log(`Listing directory file contents:\n${files.join('\n')}`);
        }
    });
}


function readContact(dsuInstance, name) {
    dsuInstance.readFile(name, (err, res) => {
        console.log('\n')
        console.table(JSON.parse(res.toString()));
    });
}

function remove(dsuInstance, name) {
    dsuInstance.delete(name, {}, (err) => {
        if (err) {
            console.log("Couldn't delete");

        }
        else {
            console.log("Deleted");
        }
    })
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
                process.exit(1);
            });
    }

    await importData(dsuInstance, json);
}

async function importData(dsuInstance, jsonData) {

    console.log("Received json: " + jsonData);

    const listContacts = JSON.parse(jsonData);

    console.log("contacts: " + listContacts);

    for (let index = 0; index < listContacts.length; index++) {
        contact = listContacts[index];
        add(dsuInstance, contact.name, contact.emai, contact.phoneNumber, contact.address);
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
        console.log(command);
        switch (command[0]) {
            case 'add':
                add(dsuInstance, command[1], command[2], command[3], command[4]);
                break;
            case 'list':
                list(dsuInstance);
                break;
            case 'read':
                readContact(dsuInstance, command[1]);
                break;
            case 'delete':
                remove(dsuInstance, command[1]);
                break;
            case 'update':
                updateData(dsuInstance, command[1], command[2], command[3], command[4]);
                break
            case 'export':
                exportData(dsuInstance);
                break;
            case 'import':
                parseJsonImport(dsuInstance, command[1]);
                break;
            case 'exit':
                process.exit(0);
        }
        runSession(dsuInstance);
    })
}

resolver.createDSU(ssiOnPassword, (err, dsuInstance) => {
    if (err) {
        throw err;
    }
    // add(dsuInstance, 'ionut', 'ionut', 'ionut', 'ionut');
    runSession(dsuInstance);
});
