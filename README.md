# Zoom - B.Dean - FTDX

First Time Developer Experience app written by Benjamin Dean.

The goal of this app is to act as a "Hello World" for developers showing:

* OAuth2 Authorization Flow
* Simple API data visualization

## Prerequisites

## How to Use This App

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

## Contributing

## License
