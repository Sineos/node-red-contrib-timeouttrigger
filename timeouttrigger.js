/**
 * Copyright Sineos
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
  'use strict';
  function TimeOutTrigger(n) {
    RED.nodes.createNode(this, n);

    this.units = n.units || 's';
    this.duration = n.duration || 5;
    this.ontimeoutval = n.ontimeoutval || '0';
    this.ontimeouttype = n.ontimeouttype || 'str';

    if (this.duration <= 0) {
      this.duration = 0;
    } else {
      if (this.units === 's') {
        this.duration = this.duration * 1000;
      }
      if (this.units === 'min') {
        this.duration = this.duration * 1000 * 60;
      }
      if (this.units === 'hr') {
        this.duration = this.duration * 1000 * 60 * 60;
      }
    }


    if ((this.ontimeouttype === 'num') && (!isNaN(this.ontimeoutval))) {
      this.ontimeoutval = Number(this.ontimeoutval);
    } else if (this.ontimeoutval === 'true' || this.ontimeoutval === 'false') {
      (this.ontimeoutval === 'true' ? this.ontimeoutval = true : this.ontimeoutval = false);
    } else if (this.ontimeoutval === 'null') {
      this.ontimeouttype = 'null';
      this.ontimeoutval = null;
    } else {
      this.ontimeoutval = String(this.ontimeoutval);
    }

    var node = this;
    var tout = null;

    this.on('input', function(msg) {
      node.send(msg);
      clearTimeout(tout);
      node.status({fill:'green', shape:'dot'});
      tout = setTimeout(function() {
        var msg2 = RED.util.cloneMessage(msg);
        msg2.payload = node.ontimeoutval;
        node.send(msg2);
        tout = null;
        node.status({fill:'red', shape:'ring', text:'timed out'});
      }, node.duration);
    });

    this.on('close', function() {
      if (tout) {
        clearTimeout(tout);
      }
      node.status({});
    });
  }
  RED.nodes.registerType('timeouttrigger', TimeOutTrigger);
};
