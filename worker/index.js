export default {
  async fetch(request, env, ctx) {
    const { url } = request;
    if (request.method === "POST") {
      if (url.includes("notifications")) {
        const input = await request.json();
        console.log(input); //{"phone":"1234567890","template":"template_name"}

        if (input.phone && input.template){
          var result = await sendNotification(input.phone, input.template,env);
          return new Response(JSON.stringify(result), init);
        } else {
          return new Response("No Phone or Template provided", {status:400});
        }
      } else if (url.includes("messages")) {
        const input = await request.json();
        console.log(input); //{"requester":"1234567890","message":"message"}

        if (input.requester && input.message){
          var messaging_id = await getIdentities(input.requester,env);
          if (messaging_id == ''){
            return new Response("No messaging_id found", {status:400});
          } else {
            var conversation_id = await getConversationId(messaging_id,env);
            if (conversation_id){
              var result = await sendMessage(conversation_id, input.message,env);
            } else {
              return new Response("No conversation_id found", {status:400});
            }
          }
        } else {
          return new Response("No requester or message provided", {status:400});
        }
      } else {
        return new Response ("No accessible path", {status:400});
      }
    } else if (request.method === "GET") {
      return new Response("The request was a GET");
    }
  }
};

async function getIdentities(requester_id, env){
  const api_endpoint = `https:///${env.zendesk_domain}.zendesk.com/api/v2/users/${requester_id}/identities.json`
  const zendesk_key = btoa(env.zendesk_admin_email + "/token:" + env.zendesk_token);

  const init = {
    method: "GET",
    headers: {
      "content-type": "application/json",
      "authorization": "Basic " + zendesk_key
    },
  };

  const response = await fetch(api_endpoint, init);
  const results = await response.json();
  console.log(results);
  for (let index = 0; index < results.identities.length; index++) {
    const identity = requester.identities[index];
    if (identity.type == "messaging"){
      var messaging_id = identity.value;
      return messaging_id;
    }
  }
  return '';
}

async function getConversationId(messaging_id, env){
  const api_endpoint = `https://api.smooch.io/v2/apps/${env.sunco_app_id}/conversations?filter[userId]=${messaging_id}`
  const sunco_key = btoa(env.sunco_key_id + ":" + env.sunco_secret_key);

  const init = {
    method: "GET",
    headers: {
      "content-type": "application/json",
      "authorization": "Basic " + sunco_key
    },
  };

  const response = await fetch(api_endpoint, init);
  const results = await response.json();
  console.log(results);
  return results.conversations[0].id;
}

async function sendMessage(conversation_id, message, env){
  const api_endpoint = `https://api.smooch.io/v2/apps/${env.sunco_app_id}/conversations/${conversation_id}/messages`
  const sunco_key = btoa(env.sunco_key_id + ":" + env.sunco_secret_key);

  var message_payload = {
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
  }
  const init = {
    body: JSON.stringify(message_payload),
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": "Basic " + sunco_key
    },
  };

  const response = await fetch(api_endpoint, init);
  const results = await response.json();
  console.log(results);
  return results;
}

async function sendNotification(phone, template, env){
  var payload = {
    "destination": {
        "integrationId": env.sunco_integration_id,
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
            "name": template,
            "language": {
                "policy": "deterministic",
                "code": "en"
            }
        }
    }
  }
  console.log(payload);

  const api_endpoint = `https://api.smooch.io/v1.1/apps/${env.sunco_app_id}/notifications`
  const sunco_key = btoa(env.sunco_key_id + ":" + env.sunco_secret_key);

  const init = {
    body: JSON.stringify(payload),
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": "Basic " + sunco_key
    },
  };

  const response = await fetch(api_endpoint, init);
  const results = await response.json();
  console.log(results);
  return results;
}