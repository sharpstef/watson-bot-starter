/**
 * This file contains all of the web and hybrid functions for interacting with 
 * the basic chat bot dialog pane. 
 *
 * @summary   Functions for Chat Bot.
 *
 * @since     0.0.1
 *
 */
 
"use strict";

// Variables for chat and stored context specific events
var params = {  // Object for parameters sent to the Watson Conversation service
    input: '',
    context: '',
};
var watson = 'Bot';
var user = '';
var context;  // Very important. Holds all the data for the current point of the chat.

/**
 * @summary Enter Keyboard Event.
 *
 * When a user presses enter in the chat input window it triggers the service interactions.
 *
 * @function newEvent
 * @param {Object} e - Information about the keyboard event. 
 */
function newEvent(e) {
	// Only check for a return/enter press - Event 13
    if (e.which === 13 || e.keyCode === 13) {

        var userInput = document.getElementById('chatMessage');
        var text = userInput.value;  // Using text as a recurring variable through functions
        text = text.replace(/(\r\n|\n|\r)/gm, ""); // Remove erroneous characters

        // If there is any input then check if this is a claim step
		// Some claim steps are handled in newEvent and others are handled in userMessage
		if (text) {
			
			// Display the user's text in the chat box and null out input box
            displayMessage(text, user);
            userInput.value = '';
            userMessage(text);
            
        } else {

            // Blank user message. Do nothing.
			console.error("No message.");
            userInput.value = '';

            return false;
        }
    }
}

/**
 * @summary Main User Interaction with Service.
 *
 * Primary function for parsing the conversation context  object.
 *
 * @function userMessage
 * @param {String} message - Input message from user or page load.  
 */
function userMessage(message) {

    // Set parameters for payload to Watson Conversation
    params.input = {
        text: message // User defined text to be sent to service
    }; 

    // Add variables to the context as more options are chosen
    if (context) {
        params.context = context; // Add a context if there is one previously stored
        params.context.username = "Stefania";
    }

    var xhr = new XMLHttpRequest();
    var uri = '/api/bot';

    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
		
		// Verify if there is a success code response and some text was sent
        if (xhr.status === 200 && xhr.responseText) {

            var response = JSON.parse(xhr.responseText);
            var text = response.output.text[0]; // Only display the first response
            context = response.context; // Store the context for next round of questions

            console.log("Got response from Bot: ", JSON.stringify(response));
            
            displayMessage(text, watson);

        } else {
            console.error('Server error for Conversation. Return status of: ', xhr.statusText);
        }
    };

    xhr.onerror = function() {
        console.error('Network error trying to send message!');
    };
	
	console.log(JSON.stringify(params));
    xhr.send(JSON.stringify(params));
}

/**
 * @summary Display Chat Bubble.
 *
 * Formats the chat bubble element based on if the message is from the user or from Bot.
 *
 * @function displayMessage
 * @param {String} text - Text to be dispalyed in chat box.
 * @param {String} user - Denotes if the message is from Bot or the user. 
 * @return null
 */
function displayMessage(text, user) {

    var chat = document.getElementById('chatBox');
    var bubble = document.createElement('div');
    bubble.className = 'message';  // Wrap the text first in a message class for common formatting

    // Set chat bubble color and position based on the user parameter
	if (user === watson) {
        bubble.innerHTML = "<div class='bot'>" + text + "</div>";
    } else {
        bubble.innerHTML = "<div class='user'>" + text + "</div>";
    }

    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;  // Move chat down to the last message displayed
    document.getElementById('chatMessage').focus();

    return null;
}