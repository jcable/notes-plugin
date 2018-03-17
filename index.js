/*
 * Copyright 2018 Julian Cable <julian.cable@yahoo.com>
 *
 */
/*jshint esversion: 6 */

const debug = require('debug')('notes');
const path = require('path');
const fs = require('fs');
const turf = require('@turf/turf');

module.exports = function (app) {
  const error = app.error || (msg => console.error(msg));
  const apiRoutePrefix = '/signalk/v1/api/resources';
  let pluginStarted = false;

  var plugin = {};

  plugin.start = function (props) {
    debug(`Start plugin notes`);
    pluginStarted === false && registerRoutes();
    pluginStarted = true;
  };

  plugin.stop = function () {
    debug(`Stop plugin notes`);
  };

  plugin.id = 'notes';
  plugin.name = 'Signal K Notes';
  plugin.description =
    "Plugin that provides a source of note resources";

  plugin.schema = {
    type: 'object',
    properties: {
    }
  };

  function registerRoutes() {
    let notesPath = path.join(app.config.configPath, "/notes");

    app.get(apiRoutePrefix + "/notes", (req, res) => {
      if(req.query.bbox) {
        bbox = turf.bboxPolygon(req.query.bbox.split(','));
      }
      else {
        bbox = undefined;
      }
      let dir = fs.readdirSync(notesPath);
      let r = {};
      for(var i=0; i<dir.length; i++) {
        let text = fs.readFileSync(notesPath+'/'+dir[i], {encoding: 'utf8'});
        let note = JSON.parse(text);
        if(bbox) {
          let point = turf.point([note.position.value.longitude,note.position.value.latitude]);
          if(turf.booleanContains(bbox, point)) {
            r[dir[i]] = note;            
          }
        }
        else {
          r[dir[i]] = note;
        }
      }
      res.json(r);
    });

    app.get(apiRoutePrefix + "/notes/:identifier", (req, res) => {
      const { identifier } = req.params;
      res.json(JSON.parse(fs.readFileSync(notesPath+'/'+identifier, {encoding: 'utf8'})));
    });

    app.get(apiRoutePrefix + "/notes/:identifier/position", (req, res) => {
      const { identifier } = req.params;
      let note = JSON.parse(fs.readFileSync(notesPath+'/'+identifier, {encoding: 'utf8'}));
      res.json(note.position.value);
    });
  }

  return plugin;

};
