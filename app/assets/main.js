var client = ZAFClient.init();
var requester,conversation_id,metadata,key,integration_id,phone;

//Add Smooch App ID and API Token
client.invoke('resize', { width: '100%', height: '200px' });

$(document).ready(async function() {
    $('#results').html('');
    
    metadata = await client.metadata();
    integration_id = metadata.settings.integration_id?metadata.settings.integration_id:'';
    $('#results').append(`
        <div class="mt-4">
            <strong>Integration ID</strong>
            <pre class="text-sm" id="integration_id">${integration_id}</pre>  
        </div>
    `);

    key = btoa(metadata.settings.key_id + ":" + metadata.settings.secret_key);
    setButtons(metadata);
    
    requester = await getRequester();
    phone = await getUser(requester);

    for (let index = 0; index < requester.identities.length; index++) {
        const identity = requester.identities[index];
        if (identity.type == "messaging"){
            var messaging_id = identity.value;
            $('#results').append(`
                <div class="mt-4">
                    <strong>Messaging ID</strong>
                    <pre class="text-sm" id="messaging_id">${messaging_id}</pre>
                </div>
            `);
            
            conversation_id = await getConversations(metadata.settings.app_id,messaging_id);
        };
    }

    $('#send_message').click(async function(){
        //get text in textfield
        var message = JSON.stringify({
            "content": {
              "type": "text",
              "text": $('#comment').val()
            },
            "author": {
              "type": "business"
            },
            "source": {
              "type": "zd:agentWorkspace"
            }
        });
        var message_result = await sendMessage(`https://api.smooch.io/v2/apps/${metadata.settings.app_id}/conversations/${conversation_id}/messages`,message);
    });
    
    $('.send_template').click(async function(){
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
                    "name": $(this).html(),
                    "language": {
                        "policy": "deterministic",
                        "code": "en"
                    }
                }
            }
        });

        var message_result = await sendMessage(`https://api.smooch.io/v1.1/apps/${metadata.settings.app_id}/notifications`,message);
    });

    $('.toggle').click(function(){
        $('.toggle').toggleClass('hidden');
        $('#metadata').toggleClass('hidden');
        client.invoke('resize', { width: '100%', height: '100vh' });
    });
});

function setButtons(metadata){
    if (metadata.settings.template_1 != ''){
        $('#send_template_1').html(metadata.settings.template_1);
    } else {
        $('#send_template_1').addClass('hidden');
    }
    if (metadata.settings.template_2 != ''){
        $('#send_template_2').html(metadata.settings.template_2);
    } else {
        $('#send_template_2').addClass('hidden');
    }
}

async function getRequester(){
    return await client.get('ticket.requester').then(function(data) {
        $('#identities').html(JSON.stringify(data['ticket.requester'].identities,null, 2));
        return data['ticket.requester'];
    });
}

async function getUser(requester){
    return await client.request({
        url: '/api/v2/users/' + requester.id,
        type: 'GET',
        dataType: 'json'
    }).then(function(data) {
        $('#phone').html(data.user.phone.replaceAll(' ', ''));
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
        $('#results').append(`
            <div class="mt-4">
                <strong>Conversation ID</strong>
                <pre class="text-sm" id="conversation_id">${data.conversations[0].id}</pre>
            </div>
        `);
        return data.conversations[0].id;
    });
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