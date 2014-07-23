#Uhuru Wiki

The goal of this project was to create an ultra-minimal wiki. No wikitext, no complicated admin system, no cluttered UI, no accounts. Click to edit a post. Drag in a photo to upload. Copy in a link to YouTube, Vimeo, GitHub Gists, or SlideShare, and it will automatically create an embed.

This is a fork of of Thomas Peklak's Node-Wiki. All of the good code was written by him, as well as most of the docs below. Most of the bad code was written by me. 

##Installation

    git clone git@github.com:neekolas/node-wiki.git
    cd node-wiki
    npm install
    ./dev

Then simply open http://localhost:3000 and edit the page. Or go to another url (e.g. http://localhost:3000/new-entry) and edit this page.

###Configuration

To configure NodeWiki to your needs you can create a `production.js` in the config folder and start it with `NODE_ENV=production node app.js.

####Options

- __port__: The port for the internal HTTP server
- __locales:__: Used locales are defined as array, e.g. `["en", "de"]`. The first locale is the default language.
- __wikiLanguage:__: Used for the text search to provide stemming support.
- __siteName:__: The name of the wiki.
- __secret__: The encryption key for cookies.
- __db.url__: The URL to MongoDB `mongodb://localhost/nodewiki`
- __keepDeletedItemsPeriod__: This is the time in milliseconds that deleted pages are kept, before they are completly wiped.

Uhuru Wiki has sensible defaults and if you do not wish to override an option you do not have to mention it in your configuration. Just provide what you want to be different.

###Localization

Currently Uhuru Wiki supports English and German out of the box. If you want a new locale you can define it in the locales directory. NodeWiki uses the [i18n-2](http://github.com/jeresig/i18n-node-2) module. Therefore it uses a JSON formattet list of key value pairs.

##Usage

see [Documentation](./help/en.md)

##Contributing

Fork the project and send me a pull request. 

###Tests

I broke a bunch of the tests when I yanked out half of the features from Node Wiki. I promise to fix them soon.

###Frontend

Uhuru Wiki uses browserify to modularize it's frontend. All frontend code is located in
`/frontend` and is compiled into `/public/javascripts/app.js`. This is
automatically done once if you start a server under production environment. If
you start the dev server with `./dev`, watchify is used to watch for
changes and recompile when needed.

