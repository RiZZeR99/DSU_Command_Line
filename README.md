# Agenta using OpenDSU technology

This project aims to provide an application that uses the OpenDSU technologies to manage contacts.

### Core components

- OpenDSU Server - server providing all the API for working with a DSU
- Worker - Node.JS script that uses the OpenDSU API in order to give the functionalities to manage contacts

## Commands

This section provides the available commands for the application

1. [Add] <name> <mail> <phone_number> <address> - add a contact to the DSU.
2. [List] - list all the contacts
3. [Read] <name> - read the information for a given name/contact
4. [Delete] <name> - deletes a contact from the DSU
5. [Update] <name> <mail> <phone_number> <address> - updates a contact
6. [Export] - exports all the contacts in a JSON format. The name of the file is the timestamp when the file was exported
7. [Import] file://<file_path> | <json_contacts> - imports a list of contacts.
The JSON must by an array of elements, each element having the following structure:
```json
{
        "name": "adrian",
        "email": "1",
        "phoneNumber": "1",
        "address": "1"
}
```
8. [Exit] - exits the program

## OpenDSU

The setup used in developing this application is the one hosted [here](https://github.com/RiZZeR99/DSU_Command_Line).

OpenDSU represents a new way to develop sself sovereign applications, whose main purpose is to increase the privacy and user's data security by functioning independently of a server/ third party application.
