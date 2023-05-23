var client = ZAFClient.init();
var conversation_id,metadata,key,integration_id,phone;

//Add Smooch App ID and API Token
client.invoke('resize', { width: '100%', height: '100vh' });

$(document).ready(async function() {
    metadata = await client.metadata();
    key = btoa(metadata.settings.key_id + ":" + metadata.settings.secret_key);
    console.log(metadata);
    var requester = await client.get('ticket.requester').then(function(data) {
        console.log(data);
        return data['ticket.requester'];
    });
    console.log(requester);

    //get identity
    var user = await client.request({
        url: '/api/v2/users/' + requester.id,
        type: 'GET',
        dataType: 'json'
    }).then(function(data) {
        return data;
    });
    phone = user.user.phone.replaceAll(' ', '');

    $('#phone').html(phone);
    $('#identities').html(JSON.stringify(requester.identities,null, 2));
    $('#results').html('');

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
            
            var conversations = await client.request({
                url: `https://api.smooch.io/v2/apps/${metadata.settings.app_id}/conversations?filter[userId]=${messaging_id}`,
                type: 'GET',
                dataType: 'json',
                headers: {
                    Authorization: "Basic " + key,
                }
            }).then(function(data) {
                return data;
            });
            console.log(conversations);
            conversation_id = conversations.conversations[0].id;
            
            $('#results').append(`
                <div class="mt-4">
                    <strong>Conversation ID</strong>
                    <pre class="text-sm" id="conversation_id">${conversation_id}</pre>
                </div>
            `);
            var messages = await client.request({
                url: `https://api.smooch.io/v2/apps/${metadata.settings.app_id}/conversations/${conversation_id}/messages`,
                type: 'GET',
                dataType: 'json',
                headers: {
                    Authorization: "Basic " + key,
                }
            }).then(function(data) {
                return data;
            });
            console.log(messages);
            integration_id = messages.messages[0]['source']['integrationId'];
            $('#results').append(`
                <div class="mt-4">
                    <strong>Integration ID</strong>
                    <pre class="text-sm" id="integration_id">${integration_id}</pre>  
                </div>
            `);
 

        };
    }

    $('#send_message').click(async function(){
        var message = JSON.stringify({
            "content": {
              "type": "text",
              "text": "Send via API!"
            },
            "author": {
              "avatarUrl": "https://verschoren.work/apple-touch-icon.png",
              "displayName": "SunCo API",
              "type": "business"
            },
            "source": {
              "type": "zd:agentWorkspace"
            }
        });

        console.log(message);
        var message_result = await client.request({
            url: `https://api.smooch.io/v2/apps/${metadata.settings.app_id}/conversations/${conversation_id}/messages`,
            type: 'POST',
            dataType: 'json',
            data: message,
            headers: {
                Authorization: "Basic " + key,
                "Content-Type": "application/json"
            }
        }).then(function(data) {
            console.log(data);
            return data;
        });
        console.log(message_result);
    });

    $('#send_template').click(async function(){
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
                    "name": "24h_reminder",
                    "language": {
                        "policy": "deterministic",
                        "code": "en"
                    },
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": "666"
                                }
                            ]
                        }
                    ]
                }
            }
        });

        console.log(message);
        var message_result = await client.request({
            url: `https://api.smooch.io/v1.1/apps/${metadata.settings.app_id}/notifications`,
            type: 'POST',
            dataType: 'json',
            data: message,
            headers: {
                Authorization: "Basic " + key,
                "Content-Type": "application/json"
            }
        }).then(function(data) {
            console.log(data);
            return data;
        });
        console.log(message_result);
    });
});