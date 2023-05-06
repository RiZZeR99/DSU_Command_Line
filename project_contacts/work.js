// load environment
require("../opendsu-sdk/psknode/bundles/openDSU");

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


function readFile(dsuInstance, name) {
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


async function getContacts(dsuInstance) {
    listContacts = [];
    dsuInstance.listFiles("/", (err, files) => {
        if (err) {

        }
        // console.log(files);

        files.forEach(element => {
            dsuInstance.readFile(element, (err, res) => {
                listContacts.push(res);
                // console.log("File: " + res);
                // return res;
            });
        });
    });
    return listContacts;
}

function exportData(dsuInstance) {
    console.log("aloooo");
    listContacts = [];
    dsuInstance.listFiles("/", (err, files) => {
        if (err) {

        }
        console.log("Files found: " + files);

        files.forEach(element => {
            dsuInstance.readFile(element, (err, result) => {
                listContacts.push(JSON.parse(result.toString()));
                console.log(listContacts);
            })
        });

    })
}


async function exportContacts(dsuInstance) {
    let contacts = await getContacts(dsuInstance);
    console.log(contacts);
}

function updateData(dsuInstance, name, mail, phoneNumber, address) {
    remove(dsuInstance, name);

    add(dsuInstance, name, mail, phoneNumber, address);
}

function runSession(dsuInstance) {
    command = readline.question("Command ", input => {
        const command = input.trim().split(' ');
        console.log(command);
        switch (command[0]) {
            case 'add':
                add(dsuInstance, command[1], command[2], command[3], command[4]);
                // add(dsuInstance, command[1], command[2]);
                break;
            case 'list':
                list(dsuInstance);
                break;
            case 'read':
                readFile(dsuInstance, command[1]);
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
    add(dsuInstance, 'ionut', 'ionut', 'ionut', 'ionut');
    runSession(dsuInstance);
});
