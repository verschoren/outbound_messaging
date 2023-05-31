# Zendesk Messaging Worker

This worker and application can be used to send messaging via Sunshne Conversations.
The full overview can be found at https://internalnote.com/sunshine-conversation-automations

## Worker
The worker has two endpoints:
### /notifications
Expects a payload of
```
{
	"phone":"1234567890",
	"template":"template_name"
}
```

### /messages
Expects a payload of
```
{
	"requester":"1234567890",
	"message":"message"
}
```

### Settings
![https://internalnote.com/content/images/2023/05/image-41.png![image](https://github.com/verschoren/outbound_messaging/assets/894026/6346e99b-1bdc-4e7e-b668-95507bdfb6e5)


## App
The app can be found in /app and allows agents to submit messages. Please check the releases in the left sidebar to find the latest version.

![https://internalnote.com/content/images/2023/05/image-45.png![image](https://github.com/verschoren/outbound_messaging/assets/894026/b721aa4d-41f5-4161-be98-d7acf52715f0)
