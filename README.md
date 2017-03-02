[![NPM](https://nodei.co/npm/node-red-contrib-timeouttrigger.png?compact=true)](https://nodei.co/npm/node-red-contrib-timeouttrigger/)
TimeOut Trigger for node-red
----------------------------

This node will pipe any received `msg` to its output. At the same time a time-out interval is set. Upon time-out a defined payload is send. Each new message will reset the time-out.

**Motivation**

This node is used for IoT as some sensors / applications will just stop sending data instead of providing a defined "no more data" indication. This means the last value will remain dangling around, making further processing uncomfortable. This node will send a defined time-out value, when no more data is received for a certain period of time.