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

  class TimeOutTrigger {
    constructor(config) {
      RED.nodes.createNode(this, config);

      this.units = config.units || 's';
      this.duration = Number(config.duration) || 5;
      this.OnTimeoutVal = config.OnTimeoutVal || '0';
      this.OnTimeoutType = config.OnTimeoutType || 'str';
      this.passthrough = config.passthrough ?? true;
      this.sendTimeoutValue = config.sendTimeoutValue ?? 'once';
      this.interval = Number(config.interval) || 5;
      this.intervalUnits = config.IntervalUnits || 's';

      this.duration *= this.getMultiplier(this.units);
      this.interval *= this.getMultiplier(this.intervalUnits);

      if (this.OnTimeoutType === 'num' && !isNaN(this.OnTimeoutVal)) {
        this.OnTimeoutVal = Number(this.OnTimeoutVal);
      } else if (this.OnTimeoutVal === 'true' || this.OnTimeoutVal === 'false') {
        this.OnTimeoutVal = (this.OnTimeoutVal === 'true');
      } else if (this.OnTimeoutVal === 'null') {
        this.OnTimeoutType = 'null';
        this.OnTimeoutVal = null;
      }

      this.on('input', this.handleInput);
      this.on('close', this.handleClose);
    }

    getMultiplier(unit) {
      switch (unit) {
        case 's': return 1000;
        case 'min': return 1000 * 60;
        case 'hr': return 1000 * 60 * 60;
        default: return 1;
      }
    }

    handleInput(msg, send, done) {
      send = send || function() {
        this.send.apply(this, arguments);
      };

      if (this.passthrough) {
        send(msg);
      }

      clearTimeout(this.tout);
      clearInterval(this.reTrigger);

      this.status({ fill: 'green', shape: 'dot' });

      const sendMessage = () => {
        const msg2 = RED.util.cloneMessage(msg);
        msg2.payload = this.OnTimeoutVal;
        send(msg2);
      };

      this.tout = setTimeout(() => {
        this.status({ fill: 'red', shape: 'ring', text: 'timed out' });

        if (this.sendTimeoutValue === 'once') {
          sendMessage();
        } else if (this.sendTimeoutValue === 'continuously') {
          sendMessage();
          this.reTrigger = setInterval(sendMessage, this.interval);
        }
      }, this.duration);

      if (done) {
        done();
      }
    }

    handleClose() {
      clearTimeout(this.tout);
      clearInterval(this.reTrigger);
      this.status({});
    }
  }

  RED.nodes.registerType('timeouttrigger', TimeOutTrigger);
};
