/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const https = require('https');

function httpsGet(url) {

    return new Promise(((resolve, reject) => {
    
        const request = https.request(url, (response) => {
        
            response.setEncoding('utf8');
        
            let returnData = '';
        
            if (response.statusCode < 200 || response.statusCode >= 300) {
        
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
        
            }
        
            response.on('data', (chunk) => {
        
            returnData += chunk;
        
        });
    
        response.on('end', () => {
    
        resolve(JSON.parse(returnData));
    
    });
    
    response.on('error', (error) => {
    
    reject(error);
    
    });
    
    });
    
    request.end();
    
    }));

}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
             return handlerInput.responseBuilder
            .speak('Welcome to the Visor Coach.')
            .reprompt('Test away by saying your utterances')
            .getResponse();
    }
};

const PlayCallHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayCall';
    },
    async handle(handlerInput) {
        
        let speakOutput = '';
        
        let myDirection = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Direction');

        let directionValue = "right";
        
        if(myDirection !== undefined){
        
            const DirectionSlot = Alexa.getSlot(handlerInput.requestEnvelope,'Direction');
            
            directionValue = DirectionSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        
        }
        
        let myType = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Type');

        let typeValue = "";
        
        if(myType !== undefined){
        
            const TypeSlot = Alexa.getSlot(handlerInput.requestEnvelope,'Type');
            
            typeValue = TypeSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        
        }
        
        let myPlay = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Number');

        let playValue = "";
        
        if(myPlay !== undefined){
        
            const PlaySlot = Alexa.getSlot(handlerInput.requestEnvelope,'Number');
            
            playValue = PlaySlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        
        }
        
        if(typeValue !== ''){
            
            let url = 'https://nasher99.github.io/Ubiquitous-Computing-JSON/plays.json';
            
            let plays = await httpsGet(url);
            
            if(playValue !== ''){
                
                if( plays[typeValue.toLowerCase()][playValue]){
                    
                    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
                    sessionAttributes.play = plays[typeValue.toLowerCase()][playValue] + ' ' + directionValue;
                    sessionAttributes.check = '';
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                    speakOutput = `Showing ${plays[typeValue.toLowerCase()][playValue]} ${directionValue}`;
                
                } else {
                
                    speakOutput = 'Sorry, that that play was not found.'
                
                }
                
            }else{
                
                if( plays[typeValue.toLowerCase()]){
                    
                    speakOutput = `Showing ${typeValue} plays. `;
                
                    speakOutput += `1. ${plays[typeValue.toLowerCase()][1]} .\n`; 
                    speakOutput += `2. ${plays[typeValue.toLowerCase()][2]} .\n`; 
                    speakOutput += `3. ${plays[typeValue.toLowerCase()][3]} .\n`; 
                    
                    speakOutput += ` To select a play say show ${typeValue} followed by the play number`; 
                        
                   
                
                } else {
                
                speakOutput = 'Sorry, that that play type was not found. Current supported play types are Run, Pass & RPO'
                
                }
                
            }
            
        }else{
            speakOutput = `You must include a play type, try show run or show right pass one`;
        }
        
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};


const CheckHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'Check';
    },
    handle(handlerInput) {
        
        let speakOutput = '';
        
        let myProtection = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Protection');

        if(myProtection !== undefined){
        
            const ProtectionSlot = Alexa.getSlot(handlerInput.requestEnvelope,'Protection');
            
            const ProtectionStatus = ProtectionSlot.resolutions.resolutionsPerAuthority[0].status.code;
            
            if( ProtectionStatus !== 'ER_SUCCESS_NO_MATCH'){
            
                let protectionValue = ProtectionSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                speakOutput = `Check Protection ${protectionValue}`;
                
                const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
                sessionAttributes.check += ` Protection ${protectionValue}`;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            }
            else{
             speakOutput = 'That Protection is not allowed, currently you can have left, right or max';
            }
        
        }
        
        let myReciver = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Receiver');
        let myRoute = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Route');

        if(myReciver !== undefined && myRoute !== undefined){
        
            const ReciverSlot = Alexa.getSlot(handlerInput.requestEnvelope,'Receiver');
            const RecieverStatus = ReciverSlot.resolutions.resolutionsPerAuthority[0].status.code;
            
            const RouteSlot = Alexa.getSlot(handlerInput.requestEnvelope,'Route');
            const RouteStatus = RouteSlot.resolutions.resolutionsPerAuthority[0].status.code;
            
            if( RecieverStatus === 'ER_SUCCESS_NO_MATCH'){
            
                speakOutput = `That Reciver is unavailable, currently you can have A, B, C or D`;
            
            }else if( RouteStatus === 'ER_SUCCESS_NO_MATCH'){
                
                 speakOutput = `That Route is unavailable, currently you can have any route from 0 to 9`;
                
            }
            else{
                let reciverValue = ReciverSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                let routeValue = RouteSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                
                speakOutput = `Check  Reciver ${reciverValue} ${routeValue}`;
                
                const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
                sessionAttributes.check += ` Reciver ${reciverValue} ${routeValue}`;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            }
        
        }
        
        
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};

const ReplayHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'Replay';
    },
    handle(handlerInput) {
        
        let speakOutput = '';
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        if(sessionAttributes.play !== undefined){
            
            let myCheck = Alexa.getSlotValue(handlerInput.requestEnvelope, 'CheckReplay');
            let checkValue = 'yes';

            if(myCheck !== undefined){
        
                const CheckSlot = Alexa.getSlot(handlerInput.requestEnvelope,'CheckReplay');
                checkValue = CheckSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            }
            
            if(checkValue.toLowerCase() === 'yes'){
                
                if(sessionAttributes.check !== undefined ||  sessionAttributes.check !== ''){
                    speakOutput = `Replaying ${sessionAttributes.play} with check to ${sessionAttributes.check} `;
                }else{
                    speakOutput = `Replaying ${sessionAttributes.play} and there were no checks `;
                }
                
            
            }else{
                
                speakOutput = `Replaying ${sessionAttributes.play}`;
            }
            
        }else{
            speakOutput = `There is no replay to show`;
        }
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};


const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayCallHandler,
        CheckHandler,
        ReplayHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
