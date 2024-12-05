## Effective Acceleration Notification Server

This microservice ingests the web push notification subscription registrations from the frontend and funnels it into the subsqiud's database.

Subsquid will check for registrations and if a relevant event occurs while indexing will send out the web push notifications to subscribed users.

### Configuration

See .env for configuration.