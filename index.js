/*
 * Copyright 2018 Julian Cable <julian.cable@yahoo.com>
 *
 */

const debug = require('debug')('notes')
const path = require('path')
const fs = require('fs')

module.exports = function (app) {
  const error = app.error || (msg => {console.error(msg)})
  const apiRoutePrefix = '/signalk/v1/api/resources'
  let pluginStarted = false

  var plugin = {}

  plugin.start = function (props) {
    debug(`Start plugin notes`)
    pluginStarted === false && registerRoutes()
    pluginStarted = true
  }

  plugin.stop = function () {
    debug(`Stop plugin notes`)
  }

  plugin.id = 'notes'
  plugin.name = 'Signal K Notes'
  plugin.description =
    "Plugin that provides a source of note resources"

  plugin.schema = {
    type: 'object',
    properties: {
    }
  }

  function registerRoutes() {
    let notesPath = path.join(app.config.configPath, "/notes")

    app.get(apiRoutePrefix + "/notes", (req, res) => {
      let dir = fs.readdirSync(notesPath)
      let r = {}
      for(var i=0; i<dir.length; i++) {
        let text = fs.readFileSync(notesPath+'/'+dir[i], {encoding: 'utf8'})
        r[dir[i]] = JSON.parse(text)
      }
      res.json(r)
    })

    app.get(apiRoutePrefix + "/notes/:identifier", (req, res) => {
      const { identifier } = req.params
      res.json(JSON.parse(fs.readFileSync(notesPath+'/'+identifier, {encoding: 'utf8'})))
    })
  }

  return plugin

}
