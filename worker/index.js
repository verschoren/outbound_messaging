export default {
  async fetch(request, env, ctx) {
    const { url } = request;
    if (request.method === "POST") {
      if (url.includes("notifications")) {

        const input = await request.json();

        if (input.phone && input.template){
          var payload = {
            "destination": {
                "integrationId": env.integration_id,
                "destinationId": input.phone
            },
            "author": {
                "role": "appMaker"
            },
            "messageSchema": "whatsapp",
            "message": {
                "type": "template",
                "template": {
                    "namespace": "XXXXXXXX_XXXX_XXXX_XXXX_XXXXXXXXXXXX",
                    "name": input.template,
                    "language": {
                        "policy": "deterministic",
                        "code": "en"
                    }
                }
            }
          }
          console.log(payload);

          const api_endpoint = `https://api.smooch.io/v1.1/apps/${env.app_id}/notifications`
          const key = btoa(env.key_id + ":" + env.secret_key);

          const init = {
            body: JSON.stringify(payload),
            method: "POST",
            headers: {
              "content-type": "application/json;charset=UTF-8",
              "authorization": "Basic " + key
            },
          };

          const response = await fetch(api_endpoint, init);
          const results = await response.json();
          console.log(results);
          return new Response(JSON.stringify(results), init);
        } else {
          return new Response("No Phone or Template provided", {status:400});
        }
      } else {
        return new Response ("No accessible path", {status:400});
      }
    } else if (request.method === "GET") {
      return new Response("The request was a GET");
    }
  },
};