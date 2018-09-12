# Zoom - Data Visualization Sample App

This is a sample application demonstrating the basics of developing an app for the Zoom Marketplace showing:

* OAuth2 Authorization Flow
* OAuth2 Refresh Flow
* Webhook Event Handling
* Zoom API Data retrieval into persistent storage
* Simple Zoom API data visualizations of your Zoom Account Activity

## Scenario / User Story

As a developer, I have been tasked by my manager to build an integration with Zoom. I am to build a simple app that pulls data from my company’s Zoom account into persistent storage, and which presents data visualizations (using Grafana or d3.js) about our Zoom account:

* # of Users
* # of Meetings
* # of Webinars
* # of Zoom Rooms
* User Activity Information
* Meeting Activity Information
* Webinar Activity Information
* Zoom Room Activity Information

## Prerequisites

TBD...

## How to Use This App

TBD...

### Locally with ngrok

Before you begin, you will need to clone this repository to your local machine, and then rename `env.tmpl` => `.env`, then update the values in the `.env` file, and finally install the app depenencies `npm install`

1. Configure and [Install your ngrok Auth token](https://ngrok.com/docs#authtoken)
2. Create a new Reserved Domain: `ftdx.{{YOUR_DOMAIN_NAME}}.{{TLD}}`, and update DNS with a new CNAME per the [ngrok docs](https://ngrok.com/docs#custom-domains)
3. Update your [ngrok configuration file](https://ngrok.com/docs#config-location) with the following

```
log_level: debug
log_format: json
tunnels:
  ftdx:
    addr: 127.0.0.1:3000
    region: {{YOUR_REGION}}
    proto: http
    hostname: {{YOUR_CUSTOM_RESERVED_CNAME}}
    remote_addr: 3000
```
4. Start your tunnel `~/ngrok start ftdx`
5. Start the app `npm start`
6. Open the [Zoom Marketplace](https://marketplace.zoom.us) and view your app's **Local Test** view, and click the "Test" button.
7. Authorize the app, and you should arrive at the configuration view, and can view the command line logs to see your new access and refresh tokens
8. Start customizing the code to try new things of your own!

### On Heroku

TBD...

## Heroku Add-Ons

* Heroku-Config

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the Zoom Developer Code of Conduct, the different ways you can contribute, and the process for submitting pull requests to us.

## License

Please see the [LICENSE](LICENSE) file for complete license details.

## Built Using

* Node.js
* Github
* Docker
* NPM
* NVM
* dotenv
* Express.js
* MongoDB
