## Effective Acceleration Notification Server

This microservice ingests the web push notification subscription registrations from the frontend and funnels it into the subsqiud's database.

Subsquid will check for registrations and if a relevant event occurs while indexing will send out the web push notifications to subscribed users.

### Configuration

See .env for configuration.

### Broadcasting notifications to all subscribed users

This is allowed only to an admin, authorized by basic auth. Example:

```
curl -X POST -H "Content-Type: application/json" -u user:password http://localhost:9000/broadcastNotification -d '{"text": "test", "href": "https://example.com"}'
```

`href` parameter is optional and will be used as a redirect link to any other resources. If omitted website will be opened at /dashboard route.
