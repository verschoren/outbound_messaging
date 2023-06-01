var client = ZAFClient.init();

var context,metadata;
var recipient,phone;
var conversation_id,key,integration_id;

client.invoke('resize', { width: '100%', height: '200px' });

$(document).ready(async function() {
    $('#results').html('');
    
    metadata = await client.metadata();
    context = await client.context();
    integration_id = metadata.settings.integration_id?metadata.settings.integration_id:'';

    key = btoa(metadata.settings.key_id + ":" + metadata.settings.secret_key);
    if (context.location == 'ticket_sidebar'){
        recipient = await getRequester();
    } else {
        recipient = await getEndUser();
    }
    
    phone = await getUser(recipient);

    for (let index = 0; index < recipient.identities.length; index++) {
        const identity = recipient.identities[index];
        if (identity.type == "messaging"){
            var messaging_id = identity.value;
            conversation_id = await getConversations(metadata.settings.app_id,messaging_id);
        };
    }

    $('#send_message').click(async function(){
        await handleMessage($('#comment').val());
    });
    
    $('.send_template').click(async function(){
        await handleTemplate($(this).html());
    });
    
    setButtons(metadata,context);
    setView(integration_id,messaging_id,conversation_id,phone,recipient);
});

async function getRequester(){
    return await client.get('ticket.requester').then(function(data) {
        return data['ticket.requester'];
    });
}

async function getEndUser(){
    return await client.get('user').then(function(data) {
        return data['user'];
    });
}

async function getUser(requester){
    return await client.request({
        url: '/api/v2/users/' + requester.id,
        type: 'GET',
        dataType: 'json'
    }).then(function(data) {
        return data.user.phone.replaceAll(' ', '');
    });
}

async function getConversations(app_id,messaging_id){
    return await client.request({
        url: `https://api.smooch.io/v2/apps/${app_id}/conversations?filter[userId]=${messaging_id}`,
        type: 'GET',
        dataType: 'json',
        headers: {
            Authorization: "Basic " + key,
        }
    }).then(function(data) {
        return data.conversations[0].id;
    });
}

async function handleMessage(message){
    //get text in textfield
    var message = JSON.stringify({
        "content": {
            "type": "text",
            "text": message
        },
        "author": {
            "type": "business"
        },
        "source": {
            "type": "zd:agentWorkspace"
        }
    });
    return await sendMessage(`https://api.smooch.io/v2/apps/${metadata.settings.app_id}/conversations/${conversation_id}/messages`,message);
}

async function handleTemplate(template_name){
    var message = JSON.stringify({
        "destination": {
            "integrationId": integration_id,
            "destinationId": phone
        },
        "author": {
            "role": "appMaker"
        },
        "messageSchema": "whatsapp",
        "message": {
            "type": "template",
            "template": {
                "namespace": "XXXXXXXX_XXXX_XXXX_XXXX_XXXXXXXXXXXX",
                "name": template_name,
                "language": {
                    "policy": "deterministic",
                    "code": "en"
                }
            }
        }
    });

    return await sendMessage(`https://api.smooch.io/v1.1/apps/${metadata.settings.app_id}/notifications`,message);
}

async function sendMessage(url,message){
    return await client.request({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: message,
        headers: {
            Authorization: "Basic " + key,
            "Content-Type": "application/json"
        }
    }).then(function(data) {
        client.invoke('notify', 'Message sent');
        return data;
    });
}